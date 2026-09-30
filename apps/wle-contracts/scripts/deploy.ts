import { ethers } from "hardhat";

/**
 * Deploy soulbound credential NFTs and grant MINTER_ROLE to the mint-service signer.
 * Does not transfer DEFAULT_ADMIN_ROLE to the hot mint key.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const minter = process.env.MINT_SERVICE_ADDRESS;
  if (!minter || !ethers.isAddress(minter)) {
    throw new Error("MINT_SERVICE_ADDRESS (checksum address) is required");
  }

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

  await training.grantRole(await training.MINTER_ROLE(), minter);
  await equipment.grantRole(await equipment.MINTER_ROLE(), minter);
  await workflow.grantRole(await workflow.MINTER_ROLE(), minter);

  console.log("deployer", deployer.address);
  console.log("minter", minter);
  console.log("TRAINING_CONTRACT_ADDRESS", await training.getAddress());
  console.log("EQUIPMENT_CONTRACT_ADDRESS", await equipment.getAddress());
  console.log("WORKFLOW_CONTRACT_ADDRESS", await workflow.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
