import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Device, User
from app.schemas import DeviceOut, DeviceCreate, DeviceUpdate
from app.auth import get_current_user, require_roles

router = APIRouter(prefix="/devices", tags=["Device Registry"])

@router.get("", response_model=List[DeviceOut])
def get_devices(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Device)
    if current_user.role == "Employee":
        query = query.filter(Device.assigned_user == current_user.full_name)
    if status:
        query = query.filter(Device.registration_status == status)
    if search:
        query = query.filter(
            (Device.device_name.ilike(f"%{search}%")) |
            (Device.assigned_user.ilike(f"%{search}%")) |
            (Device.ip_address.ilike(f"%{search}%")) |
            (Device.device_id.ilike(f"%{search}%"))
        )

    return query.order_by(Device.last_seen.desc()).all()

@router.post("", response_model=DeviceOut)
def register_device(
    device_in: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["IT Administrator", "Security Manager", "Admin"]))
):
    device_count = db.query(Device).count() + 1
    dev_id = f"DEV-{device_count:03d}"

    device = Device(
        device_id=dev_id,
        device_name=device_in.device_name,
        assigned_user=device_in.assigned_user,
        ip_address=device_in.ip_address,
        operating_system=device_in.operating_system,
        registration_status=device_in.registration_status or "Registered",
        last_seen=datetime.datetime.utcnow()
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device

@router.patch("/{device_id}", response_model=DeviceOut)
def update_device(
    device_id: int,
    updates: DeviceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["IT Administrator", "Security Manager", "Admin"]))
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if updates.registration_status is not None:
        device.registration_status = updates.registration_status
    if updates.ip_address is not None:
        device.ip_address = updates.ip_address

    device.last_seen = datetime.datetime.utcnow()
    db.commit()
    db.refresh(device)
    return device
