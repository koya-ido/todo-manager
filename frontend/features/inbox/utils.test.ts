import { InboxItem } from "@/features/inbox/hooks/useInbox";
import { getCardDetails } from "@/features/inbox/utils";
import { describe, expect, it } from "vitest";

describe("features/inbox/utils (通知機能ユーティリティ)", () => {
  describe("getCardDetails", () => {
    const dummyMessages: Record<string, string> = {
      "inbox.item.confirm": "確認する",
      "inbox.item.team-prefix": " [チーム: {teamName}]",
      "inbox.item.label.today": "今日",
      "inbox.item.title.today": "期限は今日です: {title}",
      "inbox.item.label.tomorrow": "明日",
      "inbox.item.title.tomorrow": "期限は明日です: {title}",
      "inbox.item.label.assigned": "割り当て",
      "inbox.item.title.assigned": "タスクが割り当てられました: {title}",
      "inbox.item.label.comment": "コメント",
      "inbox.item.title.comment": "「{title}」にコメント: {comment}",
      "inbox.item.label.applied": "申請",
      "inbox.item.title.applied":
        "{applicantName} ({applicantDisplayId}) から加入申請があります",
      "inbox.item.time.applied": "申請日時: {time}",
      "inbox.item.link.team": "チームページへ",
      "inbox.item.label.default": "通知",
    };

    const baseItem: InboxItem = {
      id: 1,
      target_user_id: 10,
      todo_id: null,
      type: "todo_today",
      message: "タスクメッセージ",
      is_read: false,
      created_at: "2026-06-11T08:00:00Z",
      todo: null,
    };

    it("todo_today タイプの場合、正しくタイトルとリンクを解決すること", () => {
      const item: InboxItem = {
        ...baseItem,
        type: "todo_today",
        todo_id: 123,
        todo: {
          id: 123,
          name: "お買い物",
          team_name: null,
          team_id: null,
        },
      };

      const details = getCardDetails(item, dummyMessages);
      expect(details.label).toBe("今日");
      expect(details.title).toBe("期限は今日です: お買い物");
      expect(details.linkUrl).toBe("/todo/123");
    });

    it("チーム情報が存在する場合、タイトルにチームのプレフィックスが付与されること", () => {
      const item: InboxItem = {
        ...baseItem,
        type: "todo_today",
        todo_id: 123,
        todo: {
          id: 123,
          name: "チームタスク",
          team_id: 9,
          team_name: "開発部",
        },
      };

      const details = getCardDetails(item, dummyMessages);
      expect(details.title).toBe(
        "期限は今日です: チームタスク [チーム: 開発部]",
      );
      expect(details.linkUrl).toBe("/todo/123?mode=team&teamId=9");
    });

    it("team_application_received タイプの場合、メッセージJSONをパースして情報を埋め込むこと", () => {
      const jsonMessage = JSON.stringify({
        applicant_name: "山田太郎",
        applicant_display_id: "yamada_id",
        team_id: "team-abc",
        applied_at: "2026-06-11T10:00:00Z",
      });

      const item: InboxItem = {
        ...baseItem,
        type: "team_application_received",
        message: jsonMessage,
      };

      const details = getCardDetails(item, dummyMessages);
      expect(details.label).toBe("申請");
      expect(details.title).toBe("山田太郎 (yamada_id) から加入申請があります");
      expect(details.linkUrl).toBe("/team/team-abc");
      expect(details.linkLabel).toBe("チームページへ");
    });
  });
});
