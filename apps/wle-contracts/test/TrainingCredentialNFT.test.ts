import { expect } from "chai";
import { ethers } from "hardhat";

describe("TrainingCredentialNFT", () => {
  async function deployFixture() {
    const [owner, recipient, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TrainingCredentialNFT");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return { contract, owner, recipient, other };
  }

  const baseData = {
    workerIdHash: "hash-worker-001",
    trainingType: "Confined Space",
    issuer: "Vera Safety",
    issueDate: 1_720_000_000,
    expiryDate: 1_730_000_000,
    certificateHash: "QmCertHash",
    veraRecordId: "vera-train-001",
    status: 0,
  };

  it("mints and stores credential with token id auto-increment", async () => {
    const { contract, recipient } = await deployFixture();

    await expect(contract.mintCredential(recipient.address, baseData))
      .to.emit(contract, "CredentialMinted")
      .withArgs(1, recipient.address, baseData.veraRecordId);

    const stored = await contract.credentials(1);
    expect(stored.trainingType).to.equal(baseData.trainingType);
    expect(stored.status).to.equal(baseData.status);
  });

  it("updates status and emits event", async () => {
    const { contract, recipient } = await deployFixture();

    await contract.mintCredential(recipient.address, baseData);

    await expect(contract.setStatus(1, 1))
      .to.emit(contract, "CredentialStatusChanged")
      .withArgs(1, 1);

    const stored = await contract.credentials(1);
    expect(stored.status).to.equal(1);
  });

  it("revokes credential and emits both status and revoke events", async () => {
    const { contract, recipient } = await deployFixture();

    await contract.mintCredential(recipient.address, baseData);

    await expect(contract.revokeCredential(1, "Fraud detected"))
      .to.emit(contract, "CredentialStatusChanged")
      .withArgs(1, 2);

    await expect(contract.revokeCredential(1, "Duplicate"))
      .to.emit(contract, "CredentialRevoked")
      .withArgs(1, "Duplicate");
  });

  it("restricts mint to MINTER_ROLE and revoke to ADMIN_ROLE", async () => {
    const { contract, recipient, other } = await deployFixture();
    const minterRole = await contract.MINTER_ROLE();

    await expect(contract.connect(other).mintCredential(recipient.address, baseData)).to.be.reverted;

    await contract.grantRole(minterRole, other.address);
    await contract.connect(other).mintCredential(recipient.address, baseData);

    await expect(contract.connect(other).setStatus(1, 1)).to.be.reverted;
    await expect(contract.connect(other).revokeCredential(1, "reason")).to.be.reverted;
  });

  it("validates status and date range", async () => {
    const { contract, recipient } = await deployFixture();

    await expect(
      contract.mintCredential(recipient.address, {
        ...baseData,
        status: 3,
      }),
    ).to.be.revertedWithCustomError(contract, "InvalidStatus");

    await expect(
      contract.mintCredential(recipient.address, {
        ...baseData,
        issueDate: 100,
        expiryDate: 99,
      }),
    ).to.be.revertedWithCustomError(contract, "InvalidDateRange");
  });

  it("supports baseURI and tokenURI", async () => {
    const { contract, recipient } = await deployFixture();

    await contract.setBaseURI("ipfs://vera-training/");
    await contract.mintCredential(recipient.address, baseData);

    expect(await contract.tokenURI(1)).to.equal("ipfs://vera-training/1");
  });
});
