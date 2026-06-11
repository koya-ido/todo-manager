"use client";

import { Button, ButtonLink } from "@/components/forms/Button";
import { PageContainer, PageHeader } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/Layout/Card";
import { ConfirmDialog } from "@/components/Layout/Dialog";
import { Heading } from "@/components/typography/Heading";
import { useUser } from "@/features/user/hooks/useUser";
import { apiPost } from "@/hooks/useFetchApi";
import { clearAccessToken } from "@/lib/server-actions";
import { ContentProps } from "@/types/contentTypes";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { toast } from "sonner";

export const Content: FC<ContentProps> = ({ messages }) => {
  const router = useRouter();

  const { userId, userName } = useUser();
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success(messages["user.user-id.copy"], {
        position: "top-center",
        icon: <Check size={16} color="var(--chart-2)" />,
      });
    } catch (error) {
      console.error("ユーザIDのコピーに失敗しました:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiPost("/logout");
    } catch {
      // Cookie削除を優先するため、API失敗時もフロント側のログアウトは継続する。
    }

    await clearAccessToken();
    router.push("/login");
    router.refresh();
  };

  return (
    <PageContainer className="max-w-3xl mx-auto">
      <PageHeader
        title={userName}
        description={messages["user.description"]}
      />
      <Card className="flex flex-col gap-3">
        <dl className="w-full">
          <dt>ID</dt>
          <div className="flex justify-between items-center gap-2">
            <dd className="font-bold">{userId}</dd>
            <Button
              variant="ghost"
              onClick={() => handleCopyClick()}
              className="p-0 h-auto"
            >
              <Copy size={16} color="#888888" />
            </Button>
          </div>
        </dl>
        <dl>
          <dt>{messages["user.username"]}</dt>
          <dd className="font-bold">{userName}</dd>
        </dl>
        <dl>
          <dt>{messages["user.password"]}</dt>
          <dd className="font-bold">************</dd>
        </dl>
      </Card>
      <section className="flex flex-col gap-3">
        <Heading level={3}>{messages["user.action"]}</Heading>
        <div className="w-full flex flex-col gap-3">
          <ButtonLink variant="outline" href="/user/edit" className="w-full">
            {messages["user.action.edit"]}
          </ButtonLink>
          <ButtonLink variant="outline" href="/user/setting" className="w-full">
            {messages["user.action.configure"]}
          </ButtonLink>
          <Button
            onClick={() => handleLogout()}
            className="w-full"
          >
            {messages["user.action.logout"]}
          </Button>
        </div>
      </section>
      <Card className="bg-destructive/10 border-destructive gap-3 px-0">
        <CardHeader>
          <CardTitle className="text-destructive">
            {messages["user.action.danger-zone"]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <p>{messages["user.action.danger-zone.delete.description"]}</p>
            <Button
              variant="destructive"
              onClick={() => setIsOpenDialog(true)}
              className="w-full"
            >
              {messages["user.action.danger-zone.delete"]}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isOpenDialog}
        onOpenChange={setIsOpenDialog}
        title={
          <>
            <TriangleAlert size={24} className="text-destructive" />
            {messages["user.action.danger-zone.delete.dialog-title"]}
          </>
        }
        description={messages["user.action.danger-zone.delete.dialog-description"]}
        confirmText={messages["common.delete.verb"]}
        cancelText={messages["common.cancel"]}
        buttonLayout="vertical"
        onConfirm={() => setIsOpenDialog(false)}
      />
    </PageContainer>
  );
};
