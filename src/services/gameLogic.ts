import { CITIES } from "../data/world";
import { AppError } from "../errors/appError";
import { addInventory, consumeInventory, getPlayerState, withPlayerState } from "./gameStore";
import {
  FACILITY_BUILD_COST,
  Facility,
  FacilityType,
  PlayerState,
  PRODUCT_CATALOG,
  ProductId
} from "../types/game";
import { createId } from "../utils/security";

interface BuildFacilityResult {
  facility: Facility;
  remainingBalance: number;
}

interface ProduceResult {
  productId: ProductId;
  producedQuantity: number;
  consumedInputs: Partial<Record<ProductId, number>>;
  estimatedDurationSec: number;
}

function assertCityExists(cityId: string): void {
  const cityExists = CITIES.some((city) => city.id === cityId);
  if (!cityExists) {
    throw new AppError("Invalid cityId. Choose a real city from /world/map.", 400);
  }
}

function toPositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(`${field} must be a positive integer.`, 400);
  }

  return value;
}

export async function getPlayerProfile(userId: string): Promise<PlayerState> {
  return getPlayerState(userId);
}

export async function buildFacility(params: {
  userId: string;
  type: FacilityType;
  cityId: string;
}): Promise<BuildFacilityResult> {
  assertCityExists(params.cityId);

  const buildCost = FACILITY_BUILD_COST[params.type];
  if (!buildCost) {
    throw new AppError("Unknown facility type.", 400);
  }

  const { result } = await withPlayerState(params.userId, (state) => {
    if (state.balance < buildCost) {
      throw new AppError("Insufficient balance for this facility.", 400, {
        required: buildCost,
        currentBalance: state.balance
      });
    }

    const facility: Facility = {
      id: createId(),
      type: params.type,
      cityId: params.cityId,
      level: 1,
      createdAt: new Date().toISOString()
    };

    state.balance -= buildCost;
    state.facilities.push(facility);

    return {
      facility,
      remainingBalance: state.balance
    };
  });

  return result;
}

export async function produce(params: {
  userId: string;
  facilityId: string;
  productId: ProductId;
  cycles: number;
}): Promise<ProduceResult> {
  const cycles = toPositiveInteger(params.cycles, "cycles");
  if (cycles > 24) {
    throw new AppError("cycles cannot exceed 24 in one request.", 400);
  }

  const recipe = PRODUCT_CATALOG[params.productId];
  if (!recipe) {
    throw new AppError("Unknown productId.", 400);
  }

  const { result } = await withPlayerState(params.userId, (state) => {
    const facility = state.facilities.find((item) => item.id === params.facilityId);

    if (!facility) {
      throw new AppError("Facility not found.", 404);
    }

    if (!recipe.allowedIn.includes(facility.type)) {
      throw new AppError(`${recipe.id} cannot be produced in ${facility.type}.`, 400);
    }

    const consumedInputs: Partial<Record<ProductId, number>> = {};

    for (const [inputProductId, inputAmountPerCycle] of Object.entries(recipe.inputs)) {
      const amount = (inputAmountPerCycle ?? 0) * cycles;
      if (amount <= 0) {
        continue;
      }

      const success = consumeInventory(state, inputProductId as ProductId, amount);
      if (!success) {
        throw new AppError("Insufficient input materials for production.", 400, {
          inputProductId,
          required: amount
        });
      }

      consumedInputs[inputProductId as ProductId] = amount;
    }

    const levelMultiplier = 1 + (facility.level - 1) * 0.15;
    const producedQuantity = Math.max(
      1,
      Math.floor(recipe.outputPerCycle * cycles * levelMultiplier)
    );

    addInventory(state, recipe.id, producedQuantity);

    const estimatedDurationSec = Math.floor(recipe.baseDurationSec * cycles);

    return {
      productId: recipe.id,
      producedQuantity,
      consumedInputs,
      estimatedDurationSec
    };
  });

  return result;
}
