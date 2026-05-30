from fastapi import APIRouter, HTTPException

from app.models.schemas import AddressCreateRequest, AddressResponse

router = APIRouter()
ADDRESS_STORE: list[AddressResponse] = []


@router.get("", response_model=list[AddressResponse])
def get_addresses(user_id: int = 1) -> list[AddressResponse]:
    return [item for item in ADDRESS_STORE if item.user_id == user_id]


@router.post("", response_model=AddressResponse, status_code=201)
def create_address(payload: AddressCreateRequest, user_id: int = 1) -> AddressResponse:
    if payload.is_default:
        for idx, current in enumerate(ADDRESS_STORE):
            if current.user_id == user_id:
                ADDRESS_STORE[idx] = current.model_copy(update={"is_default": False})

    address = AddressResponse(
        address_id=len(ADDRESS_STORE) + 1,
        user_id=user_id,
        **payload.model_dump(),
    )
    ADDRESS_STORE.append(address)
    return address


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(address_id: int, payload: AddressCreateRequest) -> AddressResponse:
    for idx, current in enumerate(ADDRESS_STORE):
        if current.address_id == address_id:
            updated = current.model_copy(update=payload.model_dump())
            ADDRESS_STORE[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Address not found")
