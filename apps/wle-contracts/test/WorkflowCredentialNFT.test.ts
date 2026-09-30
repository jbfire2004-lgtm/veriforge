import { expect } from "chai";
import { ethers } from "hardhat";

describe("WorkflowCredentialNFT + soulbound credentials", () => {
  it("mints workflow credential and blocks transfers", async () => {
    const [owner, recipient, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("WorkflowCredentialNFT");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    const data = {
      workflowId: "wf-1",
      workflowType: "JHA",
      issuer: "Vera",
      issueDate: 1_720_000_000,
      expiryDate: 1_730_000_000,
      workflowHash: "QmWf",
      veraRecordId: "vera-wf-1",
      status: 0,
    };

    await expect(contract.mintWorkflow(recipient.address, data))
      .to.emit(contract, "WorkflowMinted")
      .withArgs(1, recipient.address, data.veraRecordId);

    await expect(
      contract.connect(recipient).transferFrom(recipient.address, other.address, 1),
    ).to.be.revertedWithCustomError(contract, "Soulbound");
  });

  it("restricts workflow mint to MINTER_ROLE", async () => {
    const [owner, recipient, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("WorkflowCredentialNFT");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    const data = {
      workflowId: "wf-1",
      workflowType: "JHA",
      issuer: "Vera",
      issueDate: 1_720_000_000,
      expiryDate: 1_730_000_000,
      workflowHash: "QmWf",
      veraRecordId: "vera-wf-1",
      status: 0,
    };
    await expect(contract.connect(other).mintWorkflow(recipient.address, data)).to.be.reverted;
    const minterRole = await contract.MINTER_ROLE();
    await contract.grantRole(minterRole, other.address);
    await expect(contract.connect(other).mintWorkflow(recipient.address, data)).to.emit(
      contract,
      "WorkflowMinted",
    );
    void owner;
  });

  it("blocks equipment token transfers (soulbound)", async () => {
    const [owner, recipient, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EquipmentNFT");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    const data = {
      equipmentId: "EQ-1",
      serialNumber: "S1",
      equipmentType: "Crane",
      inspectionHistoryHash: "h1",
      lastInspectionDate: 1,
      nextDueDate: 2,
      veraRecordId: "vera-eq-1",
    };
    await contract.mintEquipment(recipient.address, data);
    await expect(
      contract.connect(recipient).transferFrom(recipient.address, other.address, 1),
    ).to.be.revertedWithCustomError(contract, "SoulboundTransfer");
  });
});
