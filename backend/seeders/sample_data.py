from sqlalchemy.orm import Session

import auth
import models


def get_or_create_user(db: Session, display_user_id: str, user_name: str, password: str) -> models.User:
    user = db.query(models.User).filter(models.User.display_user_id == display_user_id).first()
    if user:
        user.user_name = user_name
        user.password = auth.get_password_hash(password)
        return user

    user = models.User(
        display_user_id=display_user_id,
        user_name=user_name,
        password=auth.get_password_hash(password),
    )
    db.add(user)
    db.flush()
    return user


def seed_sample_data(db: Session) -> None:
    owner = get_or_create_user(db, "u00001", "owner", "Password-123")
    member = get_or_create_user(db, "u00002", "member", "Password-123")
    guest = get_or_create_user(db, "u00003", "guest", "Password-123")

    team = db.query(models.Team).filter(models.Team.display_teams_id == "team-alpha").first()
    if not team:
        team = models.Team(
            created_user_id=owner.id,
            display_teams_id="team-alpha",
            name="Alpha Team",
            password=auth.get_password_hash("Team-Password-123"),
        )
        db.add(team)
        db.flush()
    else:
        team.created_user_id = owner.id
        team.name = "Alpha Team"
        team.password = auth.get_password_hash("Team-Password-123")

    memberships = {(team.id, owner.id), (team.id, member.id)}
    existing_memberships = {
        (item.team_id, item.user_id)
        for item in db.query(models.TeamUser).filter(models.TeamUser.team_id == team.id).all()
    }
    for team_id, user_id in memberships - existing_memberships:
        db.add(models.TeamUser(team_id=team_id, user_id=user_id))

    # Betaチーム（owner/memberが未加入のチーム）
    team_beta = db.query(models.Team).filter(models.Team.display_teams_id == "team-beta").first()
    if not team_beta:
        team_beta = models.Team(
            created_user_id=guest.id,
            display_teams_id="team-beta",
            name="Beta Team",
            password=auth.get_password_hash("Team-Password-456"),
        )
        db.add(team_beta)
        db.flush()
    else:
        team_beta.created_user_id = guest.id
        team_beta.name = "Beta Team"
        team_beta.password = auth.get_password_hash("Team-Password-456")

    # Gammaチーム（owner/memberが未加入のチーム）
    team_gamma = db.query(models.Team).filter(models.Team.display_teams_id == "team-gamma").first()
    if not team_gamma:
        team_gamma = models.Team(
            created_user_id=guest.id,
            display_teams_id="team-gamma",
            name="Gamma Team",
            password=auth.get_password_hash("Team-Password-789"),
        )
        db.add(team_gamma)
        db.flush()
    else:
        team_gamma.created_user_id = guest.id
        team_gamma.name = "Gamma Team"
        team_gamma.password = auth.get_password_hash("Team-Password-789")

    # betaとgammaのメンバーシップに作成者であるguestを追加
    beta_memberships = {(team_beta.id, guest.id)}
    existing_beta_memberships = {
        (item.team_id, item.user_id)
        for item in db.query(models.TeamUser).filter(models.TeamUser.team_id == team_beta.id).all()
    }
    for team_id, user_id in beta_memberships - existing_beta_memberships:
        db.add(models.TeamUser(team_id=team_id, user_id=user_id))

    gamma_memberships = {(team_gamma.id, guest.id)}
    existing_gamma_memberships = {
        (item.team_id, item.user_id)
        for item in db.query(models.TeamUser).filter(models.TeamUser.team_id == team_gamma.id).all()
    }
    for team_id, user_id in gamma_memberships - existing_gamma_memberships:
        db.add(models.TeamUser(team_id=team_id, user_id=user_id))

    private_tag = db.query(models.Tag).filter(
        models.Tag.user_id == owner.id,
        models.Tag.name == "personal",
    ).first()
    if not private_tag:
        private_tag = models.Tag(user_id=owner.id, name="personal")
        db.add(private_tag)
        db.flush()

    urgent_tag = db.query(models.Tag).filter(
        models.Tag.team_id == team.id,
        models.Tag.name == "urgent",
    ).first()
    if not urgent_tag:
        urgent_tag = models.Tag(team_id=team.id, name="urgent")
        db.add(urgent_tag)
        db.flush()

    private_todo = db.query(models.Todo).filter(models.Todo.name == "Buy groceries").first()
    if not private_todo:
        private_todo = models.Todo(
            priority_id=2,
            status_id=1,
            team_id=None,
            manager_id=owner.id,
            created_by=owner.id,
            updated_by=owner.id,
            name="Buy groceries",
            remarks="Milk, bread, eggs",
        )
        db.add(private_todo)
        db.flush()

    team_todo = db.query(models.Todo).filter(models.Todo.name == "Prepare sprint board").first()
    if not team_todo:
        team_todo = models.Todo(
            priority_id=1,
            status_id=2,
            team_id=team.id,
            manager_id=member.id,
            created_by=owner.id,
            updated_by=member.id,
            name="Prepare sprint board",
            remarks="Board setup for next sprint planning",
        )
        db.add(team_todo)
        db.flush()

    for todo, position, title, content, done in (
        (private_todo, 1, "Create shopping list", "Check fridge before buying", False),
        (private_todo, 2, "Go to supermarket", None, False),
        (team_todo, 1, "Collect backlog items", "Review Jira tickets", True),
        (team_todo, 2, "Set assignees", "Assign owners for top 5 tasks", False),
    ):
        task = db.query(models.Task).filter(
            models.Task.todo_id == todo.id,
            models.Task.position == position,
        ).first()
        if not task:
            db.add(
                models.Task(
                    todo_id=todo.id,
                    position=position,
                    title=title,
                    content=content,
                    completion_flag=done,
                )
            )

    for todo, tag in ((private_todo, private_tag), (team_todo, urgent_tag)):
        todo_tag = db.query(models.TodoTag).filter(
            models.TodoTag.todo_id == todo.id,
            models.TodoTag.tag_id == tag.id,
        ).first()
        if not todo_tag:
            db.add(models.TodoTag(todo_id=todo.id, tag_id=tag.id))

    comment_specs = (
        (owner.id, private_todo.id, "Remember to use discount coupons"),
        (member.id, team_todo.id, "I will finalize the board by 5pm"),
    )
    for user_id, todo_id, body in comment_specs:
        comment = db.query(models.Comment).filter(
            models.Comment.user_id == user_id,
            models.Comment.todo_id == todo_id,
            models.Comment.comment == body,
        ).first()
        if not comment:
            db.add(models.Comment(user_id=user_id, todo_id=todo_id, comment=body))

    inbox_specs = (
        (owner.id, private_todo.id, "todo_reminder", "Private todo deadline is approaching"),
        (guest.id, team_todo.id, "team_notice", "Sprint board is being prepared"),
    )
    for target_user_id, todo_id, inbox_type, message in inbox_specs:
        inbox = db.query(models.Inbox).filter(
            models.Inbox.target_user_id == target_user_id,
            models.Inbox.todo_id == todo_id,
            models.Inbox.type == inbox_type,
            models.Inbox.message == message,
        ).first()
        if not inbox:
            db.add(
                models.Inbox(
                    target_user_id=target_user_id,
                    todo_id=todo_id,
                    type=inbox_type,
                    message=message,
                )
            )
