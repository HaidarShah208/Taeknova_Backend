import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { AddressRepository } from "@modules/addresses/address.repository";
import type { Address } from "@modules/addresses/address.entity";

export class AddressService {
  constructor(private readonly addressRepository = new AddressRepository()) {}

  list(userId: string) {
    return this.addressRepository.findByUser(userId);
  }

  async create(userId: string, payload: Record<string, unknown>): Promise<Address> {
    const addr = this.addressRepository.create({ ...payload, userId } as Partial<Address>);
    if (payload.isDefault) {
      await this.clearDefaults(userId);
    }
    return this.addressRepository.save(addr);
  }

  async update(userId: string, addressId: string, payload: Partial<Address>): Promise<Address> {
    const addr = await this.addressRepository.findByIdAndUser(addressId, userId);
    if (!addr) throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
    if (payload.isDefault === true) {
      await this.clearDefaults(userId);
    }
    Object.assign(addr, payload);
    return this.addressRepository.save(addr);
  }

  async remove(userId: string, addressId: string): Promise<void> {
    const addr = await this.addressRepository.findByIdAndUser(addressId, userId);
    if (!addr) throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
    await this.addressRepository.deleteById(addressId);
  }

  private async clearDefaults(userId: string): Promise<void> {
    const list = await this.addressRepository.findByUser(userId);
    for (const a of list) {
      if (a.isDefault) {
        a.isDefault = false;
        await this.addressRepository.save(a);
      }
    }
  }
}
