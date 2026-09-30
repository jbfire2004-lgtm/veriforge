import { expect } from "chai";
import { ethers } from "hardhat";

describe("EquipmentNFT", () => {
  async function deployFixture() {
    const [owner, recipient, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EquipmentNFT");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return { contract, owner, recipient, other };
  }

  const baseData = {
    equipmentId: "EQ-001",
    serialNumber: "SER-001",
    equipmentType: "Crane",
    inspectionHistoryHash: "QmHistory",
    lastInspectionDate: 1_720_000_000,
    nextDueDate: 1_730_000_000,
    veraRecordId: "vera-equip-001",
  };

  it("mints with auto-incrementing token ids", async () => {
    const { contract, recipient } = await deployFixture();

    await expect(contract.mintEquipment(recipient.address, baseData))
      .to.emit(contract, "EquipmentMinted")
      .withArgs(1, recipient.address, baseData.veraRecordId);

    await expect(
      contract.mintEquipment(recipient.address, {
        ...baseData,
        equipmentId: "EQ-002",
        serialNumber: "SER-002",
        veraRecordId: "vera-equip-002",
      }),
    )
      .to.emit(contract, "EquipmentMinted")
      .withArgs(2, recipient.address, "vera-equip-002");
  });

  it("stores equipment record and supports update", async () => {
    const { contract, recipient } = await deployFixture();

    await contract.mintEquipment(recipient.address, baseData);
    const created = await contract.equipmentRecords(1);
    expect(created.equipmentId).to.equal(baseData.equipmentId);
    expect(created.equipmentType).to.equal(baseData.equipmentType);

    const updatedData = {
      ...baseData,
      inspectionHistoryHash: "QmHistory2",
      lastInspectionDate: 1_725_000_000,
      nextDueDate: 1_735_000_000,
    };

    await expect(contract.updateEquipment(1, updatedData))
      .to.emit(contract, "EquipmentUpdated")
      .withArgs(1);

    const updated = await contract.equipmentRecords(1);
    expect(updated.inspectionHistoryHash).to.equal(updatedData.inspectionHistoryHash);
    expect(updated.lastInspectionDate).to.equal(updatedData.lastInspectionDate);
  });

  it("restricts mint to MINTER_ROLE and updates to ADMIN_ROLE", async () => {
    const { contract, recipient, other } = await deployFixture();
    const minterRole = await contract.MINTER_ROLE();
    const adminRole = await contract.ADMIN_ROLE();

    await expect(contract.connect(other).mintEquipment(recipient.address, baseData)).to.be.reverted;

    await contract.grantRole(minterRole, other.address);
    await expect(contract.connect(other).mintEquipment(recipient.address, baseData)).to.emit(
      contract,
      "EquipmentMinted",
    );

    await expect(contract.connect(other).updateEquipment(1, baseData)).to.be.reverted;
    await contract.grantRole(adminRole, other.address);
    await expect(contract.connect(other).updateEquipment(1, baseData)).to.emit(contract, "EquipmentUpdated");

    await contract.revokeRole(minterRole, other.address);
    await expect(
      contract.connect(other).mintEquipment(recipient.address, { ...baseData, equipmentId: "EQ-x" }),
    ).to.be.reverted;
  });

  it("reverts for invalid date range", async () => {
    const { contract, recipient } = await deployFixture();

    await expect(
      contract.mintEquipment(recipient.address, {
        ...baseData,
        lastInspectionDate: 10,
        nextDueDate: 9,
      }),
    )
      .to.be.revertedWithCustomError(contract, "InvalidDateRange");
  });

  it("supports baseURI and tokenURI composition", async () => {
    const { contract, recipient } = await deployFixture();

    await contract.setBaseURI("https://vera.example/meta/");
    await contract.mintEquipment(recipient.address, baseData);

    const uri = await contract.tokenURI(1);
    expect(uri).to.equal("https://vera.example/meta/1");
  });
});
