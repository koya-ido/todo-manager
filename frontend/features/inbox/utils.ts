import { InboxItem } from "@/features/inbox/hooks/useInbox";
import { toDisplayDateTime } from "@/utils/DateUtils";
export { toDisplayDateTime };

export const getCardDetails = (
  item: InboxItem,
  messages: Record<string, string>,
) => {
  let label = "";
  let labelBg = "bg-slate-500 text-white";
  let title = "";
  let subInfo = "";
  let linkUrl = "";
  let linkLabel = messages["inbox.item.confirm"];

  // JSONメッセージのパースを試みる
  let parsedMessage: Record<string, any> = {};
  try {
    if (item.message.startsWith("{")) {
      parsedMessage = JSON.parse(item.message);
    }
  } catch {
    // パース失敗時はプレーンテキストとして扱う
  }

  const teamPrefix = item.todo?.team_name
    ? messages["inbox.item.team-prefix"].replace(
        "{teamName}",
        item.todo.team_name,
      )
    : "";

  switch (item.type) {
    case "todo_today":
      label = messages["inbox.item.label.today"];
      labelBg = "bg-red-500 text-white font-bold";
      title =
        messages["inbox.item.title.today"].replace(
          "{title}",
          item.todo?.name || item.message,
        ) + teamPrefix;
      if (item.todo_id) {
        linkUrl = item.todo?.team_id
          ? `/todo/${item.todo_id}?mode=team&teamId=${item.todo.team_id}`
          : `/todo/${item.todo_id}`;
      }
      break;

    case "todo_tomorrow":
      label = messages["inbox.item.label.tomorrow"];
      labelBg = "bg-slate-800 text-white font-bold dark:bg-slate-700";
      title =
        messages["inbox.item.title.tomorrow"].replace(
          "{title}",
          item.todo?.name || item.message,
        ) + teamPrefix;
      if (item.todo_id) {
        linkUrl = item.todo?.team_id
          ? `/todo/${item.todo_id}?mode=team&teamId=${item.todo.team_id}`
          : `/todo/${item.todo_id}`;
      }
      break;

    case "team_todo_assigned":
      label = messages["inbox.item.label.assigned"];
      labelBg = "bg-blue-600 text-white font-bold";
      title =
        messages["inbox.item.title.assigned"].replace(
          "{title}",
          item.todo?.name || item.message,
        ) + teamPrefix;
      if (item.todo_id) {
        linkUrl = item.todo?.team_id
          ? `/todo/${item.todo_id}?mode=team&teamId=${item.todo.team_id}`
          : `/todo/${item.todo_id}`;
      }
      break;

    case "todo_comment":
      label = messages["inbox.item.label.comment"];
      labelBg = "bg-emerald-600 text-white font-bold";
      title =
        messages["inbox.item.title.comment"]
          .replace("{title}", item.todo?.name || "")
          .replace("{comment}", item.message) + teamPrefix;
      if (item.todo_id) {
        linkUrl = item.todo?.team_id
          ? `/todo/${item.todo_id}?mode=team&teamId=${item.todo.team_id}`
          : `/todo/${item.todo_id}`;
      }
      break;

    case "team_application_received":
      label = messages["inbox.item.label.applied"];
      labelBg = "bg-purple-600 text-white font-bold";
      title = messages["inbox.item.title.applied"]
        .replace("{applicantName}", parsedMessage.applicant_name || "Unknown")
        .replace(
          "{applicantDisplayId}",
          parsedMessage.applicant_display_id || "------",
        );
      subInfo = messages["inbox.item.time.applied"].replace(
        "{time}",
        toDisplayDateTime(parsedMessage.applied_at || item.created_at),
      );
      if (parsedMessage.team_id) {
        linkUrl = `/team/${parsedMessage.team_id}`;
        linkLabel = messages["inbox.item.link.team"];
      }
      break;

    case "team_application_approved":
      label = messages["inbox.item.label.approved"];
      labelBg = "bg-teal-600 text-white font-bold";
      title = messages["inbox.item.title.approved"]
        .replace("{teamName}", parsedMessage.team_name || "Unknown")
        .replace("{teamDisplayId}", parsedMessage.team_display_id || "------");
      subInfo = messages["inbox.item.time.approved"].replace(
        "{time}",
        toDisplayDateTime(parsedMessage.approved_at || item.created_at),
      );
      if (parsedMessage.team_id) {
        linkUrl = `/team/${parsedMessage.team_id}`;
        linkLabel = messages["inbox.item.link.team"];
      }
      break;

    case "team_member_left":
      label = messages["inbox.item.label.member-left"];
      labelBg = "bg-orange-600 text-white font-bold";
      title = messages["inbox.item.title.member-left"]
        .replace("{teamName}", parsedMessage.team_name || "Unknown")
        .replace("{leftUserName}", parsedMessage.left_user_name || "Unknown")
        .replace(
          "{leftUserDisplayId}",
          parsedMessage.left_user_display_id || "------",
        );
      subInfo = messages["inbox.item.time.member-left"].replace(
        "{time}",
        toDisplayDateTime(parsedMessage.left_at || item.created_at),
      );
      if (parsedMessage.team_id) {
        linkUrl = `/team/${parsedMessage.team_id}`;
        linkLabel = messages["inbox.item.link.team"];
      }
      break;

    case "team_member_kicked":
      label = messages["inbox.item.label.kicked"];
      labelBg = "bg-rose-700 text-white font-bold";
      title = messages["inbox.item.title.kicked"]
        .replace("{teamName}", parsedMessage.team_name || "Unknown")
        .replace("{teamDisplayId}", parsedMessage.team_display_id || "------");
      subInfo = messages["inbox.item.time.kicked"].replace(
        "{time}",
        toDisplayDateTime(parsedMessage.kicked_at || item.created_at),
      );
      linkUrl = "/team";
      linkLabel = messages["inbox.item.link.team"];
      break;

    default:
      label = messages["inbox.item.label.default"];
      title = item.message;
      break;
  }

  return { label, labelBg, title, subInfo, linkUrl, linkLabel };
};
