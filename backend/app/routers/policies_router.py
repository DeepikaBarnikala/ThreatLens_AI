import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Policy, User
from app.schemas import PolicyOut, PolicyCreate, PolicyUpdate
from app.auth import get_current_user, require_roles

router = APIRouter(prefix="/policies", tags=["Security Policies"])

@router.get("", response_model=List[PolicyOut])
def get_policies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Policy).order_by(Policy.id.asc()).all()

@router.post("", response_model=PolicyOut)
def create_policy(
    policy_in: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Security Manager", "Admin"]))
):
    existing = db.query(Policy).filter(Policy.policy_key == policy_in.policy_key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Policy with this key already exists")

    policy = Policy(
        policy_key=policy_in.policy_key,
        name=policy_in.name,
        category=policy_in.category,
        description=policy_in.description,
        value=policy_in.value,
        is_enforced=policy_in.is_enforced
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.patch("/{policy_id}", response_model=PolicyOut)
def update_policy(
    policy_id: int,
    updates: PolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Security Manager", "Admin"]))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    if updates.value is not None:
        policy.value = updates.value
    if updates.is_enforced is not None:
        policy.is_enforced = updates.is_enforced
    if updates.description is not None:
        policy.description = updates.description

    policy.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(policy)
    return policy
