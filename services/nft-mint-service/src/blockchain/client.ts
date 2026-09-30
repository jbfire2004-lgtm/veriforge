import {
  Contract,
  JsonRpcProvider,
  Wallet,
  getAddress,
  type TransactionRequest,
} from "ethers";
import { config } from "../config";
import {
  EquipmentData,
  MintResult,
  TrainingCredentialData,
  WorkflowData,
} from "../types/contracts";

const TRAINING_ABI = [
  "function mintCredential(address to, tuple(string workerIdHash,string trainingType,string issuer,uint64 issueDate,uint64 expiryDate,string certificateHash,string veraRecordId,uint8 status) data) external returns (uint256)",
];

const WORKFLOW_ABI = [
  "function mintWorkflow(address to, tuple(string workflowId,string workflowType,string issuer,uint64 issueDate,uint64 expiryDate,string workflowHash,string veraRecordId,uint8 status) data) external returns (uint256)",
];

const EQUIPMENT_ABI = [
  "function mintEquipment(address to, tuple(string equipmentId,string serialNumber,string equipmentType,string inspectionHistoryHash,uint64 lastInspectionDate,uint64 nextDueDate,string veraRecordId) data) external returns (uint256)",
];

export class BlockchainClient {
  private readonly mintProvider: JsonRpcProvider;
  private readonly observerProvider: JsonRpcProvider;
  private readonly wallet: Wallet | null;
  private readonly trainingContract: Contract;
  private readonly workflowContract: Contract;
  private readonly equipmentContract: Contract;
  private chainIdReady: Promise<void>;

  constructor() {
    this.mintProvider = new JsonRpcProvider(config.RPC_URL);
    this.observerProvider = new JsonRpcProvider(config.observerRpcUrl);

    this.wallet =
      config.SIGNER_MODE === "env" && config.PRIVATE_KEY
        ? new Wallet(config.PRIVATE_KEY, this.mintProvider)
        : null;

    const signerOrProvider = this.wallet ?? this.mintProvider;

    this.trainingContract = new Contract(
      getAddress(config.TRAINING_CONTRACT_ADDRESS),
      TRAINING_ABI,
      signerOrProvider,
    );
    this.workflowContract = new Contract(
      getAddress(config.WORKFLOW_CONTRACT_ADDRESS),
      WORKFLOW_ABI,
      signerOrProvider,
    );
    this.equipmentContract = new Contract(
      getAddress(config.EQUIPMENT_CONTRACT_ADDRESS),
      EQUIPMENT_ABI,
      signerOrProvider,
    );

    this.chainIdReady = this.assertChainId();
  }

  private async assertChainId(): Promise<void> {
    if (config.EXPECTED_CHAIN_ID == null) return;
    const network = await this.observerProvider.getNetwork();
    if (Number(network.chainId) !== config.EXPECTED_CHAIN_ID) {
      throw new Error(
        `Chain ID mismatch: expected ${config.EXPECTED_CHAIN_ID}, got ${network.chainId}`,
      );
    }
  }

  private async waitForFinality(txHash: string): Promise<number> {
    const deadline = Date.now() + config.TX_CONFIRM_TIMEOUT_MS;
    let receipt = await this.observerProvider.getTransactionReceipt(txHash);
    while (!receipt && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, config.TX_RECEIPT_POLL_MS));
      receipt = await this.observerProvider.getTransactionReceipt(txHash);
    }
    if (!receipt || receipt.blockNumber == null) {
      throw new Error(`Transaction not confirmed: ${txHash}`);
    }

    // Wait for min confirmations + reorg re-check of block hash
    const target = receipt.blockNumber + config.MIN_CONFIRMATIONS - 1;
    while (Date.now() < deadline) {
      const head = await this.observerProvider.getBlockNumber();
      if (head >= target) break;
      await new Promise((r) => setTimeout(r, config.TX_RECEIPT_POLL_MS));
    }

    const rechecked = await this.observerProvider.getTransactionReceipt(txHash);
    if (!rechecked || rechecked.blockNumber == null) {
      throw new Error(`Transaction missing after reorg check: ${txHash}`);
    }
    if (rechecked.blockHash !== receipt.blockHash) {
      // Deep reorg — wait again once more from new receipt
      return this.waitForFinality(txHash);
    }
    return rechecked.blockNumber;
  }

  private async sendMint(
    contract: Contract,
    method: string,
    args: unknown[],
  ): Promise<MintResult> {
    await this.chainIdReady;

    if (config.SIGNER_MODE === "remote") {
      return this.sendViaRemoteSigner(contract, method, args);
    }

    if (!this.wallet) {
      throw new Error("Local signer not configured");
    }

    const tokenId = await contract[method].staticCall(...args);
    const feeData = await this.mintProvider.getFeeData();
    const overrides: TransactionRequest = {};
    if (feeData.maxFeePerGas) overrides.maxFeePerGas = feeData.maxFeePerGas;
    if (feeData.maxPriorityFeePerGas) {
      overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    }

    const tx = await contract[method](...args, overrides);
    await this.waitForFinality(tx.hash);

    return {
      tokenId: tokenId.toString(),
      txHash: tx.hash,
    };
  }

  /**
   * Remote/KMS isolation: submit unsigned call data to an external signer that never
   * exposes the private key to this process.
   */
  private async sendViaRemoteSigner(
    contract: Contract,
    method: string,
    args: unknown[],
  ): Promise<MintResult> {
    if (!config.REMOTE_SIGNER_URL) {
      throw new Error("REMOTE_SIGNER_URL not configured");
    }

    const data: string = contract.interface.encodeFunctionData(method, args);
    const to = await contract.getAddress();
    const feeData = await this.mintProvider.getFeeData();
    const network = await this.mintProvider.getNetwork();

    const response = await fetch(config.REMOTE_SIGNER_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(config.REMOTE_SIGNER_TOKEN
          ? { authorization: `Bearer ${config.REMOTE_SIGNER_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        chainId: Number(network.chainId),
        to,
        data,
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Remote signer failed: ${response.status} ${text}`);
    }

    const body = (await response.json()) as {
      txHash?: string;
      tokenId?: string;
    };
    if (!body.txHash) throw new Error("Remote signer response missing txHash");
    await this.waitForFinality(body.txHash);

    // Prefer explicit tokenId from signer; otherwise re-decode events via receipt.
    let tokenId = body.tokenId;
    if (!tokenId) {
      const receipt = await this.observerProvider.getTransactionReceipt(body.txHash);
      tokenId = receipt?.logs?.[0]
        ? BigInt(receipt.logs[0].topics?.[3] ?? "0").toString()
        : "0";
    }

    return { tokenId, txHash: body.txHash };
  }

  async mintTrainingCredential(
    walletAddress: string,
    metadata: TrainingCredentialData,
  ): Promise<MintResult> {
    const to = getAddress(walletAddress);
    return this.sendMint(this.trainingContract, "mintCredential", [to, metadata]);
  }

  async mintWorkflow(
    walletAddress: string,
    metadata: WorkflowData,
  ): Promise<MintResult> {
    const to = getAddress(walletAddress);
    return this.sendMint(this.workflowContract, "mintWorkflow", [to, metadata]);
  }

  async mintEquipment(
    walletAddress: string,
    metadata: EquipmentData,
  ): Promise<MintResult> {
    const to = getAddress(walletAddress);
    return this.sendMint(this.equipmentContract, "mintEquipment", [to, metadata]);
  }
}

export const blockchainClient = new BlockchainClient();
