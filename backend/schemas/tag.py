from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TagRequest(BaseModel):
    name: str


class TagUpdate(TagRequest):
    pass


class TagResponse(TagRequest):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    team_id: Optional[int] = None
    delete_flag: bool = False
    created_at: datetime
    updated_at: datetime
