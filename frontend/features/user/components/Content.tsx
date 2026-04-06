"use client";

import { LocaleContext } from "@/components/features/LocaleProvider/LocaleProvider";
import { LocaleSwitcher } from "@/components/features/LocaleSwitcher";
import { Button } from "@/components/forms/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/Layout/Card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Layout/Dialog";
import { Heading } from "@/components/typography/Heading";
import { useUser } from "@/features/user/hooks/useUser";
import { ContentProps } from "@/types/contentTypes";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { FC, useContext, useState } from "react";
import { toast } from "sonner";

export const Content: FC<ContentProps> = ({ messages }) => {
  const { userId, userName } = useUser();
  const { locale } = useContext(LocaleContext);
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

  return (
    <div className="w-full flex flex-col justify-center gap-5">
      <Heading level={1}>{userName}</Heading>
      <Heading level={2}>{messages["user.description"]}</Heading>
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
          <Button variant="outline" className="w-full">
            {messages["user.action.edit"]}
          </Button>
          <Button variant="outline" className="w-full">
            {messages["user.action.configure"]}
          </Button>
          <Button variant="outline" className="w-full">
            {messages["user.action.logout"]}
          </Button>
        </div>
      </section>
      <Dialog open={isOpenDialog}>
        <Card className="bg-destructive/10 border-destructive gap-3 px-0">
          <CardHeader>
            <CardTitle className="text-destructive">
              {messages["user.action.danger-zone"]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p>{messages["user.action.danger-zone.delete.description"]}</p>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  onClick={() => setIsOpenDialog(true)}
                  className="w-full"
                >
                  {messages["user.action.danger-zone.delete"]}
                </Button>
              </DialogTrigger>
            </div>
          </CardContent>
        </Card>
        <LocaleSwitcher currentLocale={locale} />
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center justify-center gap-2">
              <TriangleAlert size={24} color="var(--destructive)" />
              {messages["user.action.danger-zone.delete.dialog-title"]}
            </DialogTitle>
          </DialogHeader>
          <p>{messages["user.action.danger-zone.delete.dialog-description"]}</p>
          <DialogFooter>
            <div className="w-full flex flex-col gap-2">
              <Button variant="destructive" className="w-full">
                {messages["user.action.danger-zone.delete.dialog-confirm"]}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpenDialog(false)}
              >
                {messages["user.action.danger-zone.delete.dialog-cancel"]}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
