import { ethers } from "hardhat";

/**
 * Local Telcoin-shaped soak: deploy AccessControl NFTs, mint as MINTER_ROLE,
 * assert soulbound transfer revert. No Axelar / L1 claims.
 */
async function main() {
  const [admin, minter, worker, other] = await ethers.getSigners();

  const Training = await ethers.getContractFactory("TrainingCredentialNFT");
  const Equipment = await ethers.getContractFactory("EquipmentNFT");
  const Workflow = await ethers.getContractFactory("WorkflowCredentialNFT");

  const training = await Training.deploy();
  const equipment = await Equipment.deploy();
  const workflow = await Workflow.deploy();
  await Promise.all([
    training.waitForDeployment(),
    equipment.waitForDeployment(),
    workflow.waitForDeployment(),
  ]);

  const minterRole = await training.MINTER_ROLE();
  await training.grantRole(minterRole, minter.address);
  await equipment.grantRole(await equipment.MINTER_ROLE(), minter.address);
  await workflow.grantRole(await workflow.MINTER_ROLE(), minter.address);

  await training.connect(minter).mintCredential(worker.address, {
    workerIdHash: "soak-worker",
    trainingType: "Hot Work",
    issuer: "Vera Soak",
    issueDate: 1_720_000_000,
    expiryDate: 1_730_000_000,
    certificateHash: "QmSoak",
    veraRecordId: "soak-train-1",
    status: 0,
  });

  await equipment.connect(minter).mintEquipment(worker.address, {
    equipmentId: "EQ-SOAK",
    serialNumber: "SN-SOAK",
    equipmentType: "Crane",
    inspectionHistoryHash: "h",
    lastInspectionDate: 1,
    nextDueDate: 2,
    veraRecordId: "soak-eq-1",
  });

  await workflow.connect(minter).mintWorkflow(worker.address, {
    workflowId: "wf-soak",
    workflowType: "JHA",
    issuer: "Vera Soak",
    issueDate: 1,
    expiryDate: 2,
    workflowHash: "QmWfSoak",
    veraRecordId: "soak-wf-1",
    status: 0,
  });

  await training
    .connect(worker)
    .transferFrom(worker.address, other.address, 1)
    .then(
      () => {
        throw new Error("training transfer should revert");
      },
      () => undefined,
    );
  await equipment
    .connect(worker)
    .transferFrom(worker.address, other.address, 1)
    .then(
      () => {
        throw new Error("equipment transfer should revert");
      },
      () => undefined,
    );
  await workflow
    .connect(worker)
    .transferFrom(worker.address, other.address, 1)
    .then(
      () => {
        throw new Error("workflow transfer should revert");
      },
      () => undefined,
    );

  console.log("TELCOIN_LOCAL_SOAK_OK");
  console.log("admin", admin.address);
  console.log("minter", minter.address);
  console.log("training", await training.getAddress());
  console.log("equipment", await equipment.getAddress());
  console.log("workflow", await workflow.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
