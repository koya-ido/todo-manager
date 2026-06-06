"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";

import { Separator } from "@/components/Layout/Separator";
import { Label } from "@/components/forms/Label";
import { cn } from "@/lib/utils";

/**
 * Shadcn UI の FieldSetコンポーネント
 * 間隔設定済みのセマンティクスをレンダリングするコンテナ
 * @returns fieldset要素
 */
const FieldSet = ({
  className,
  ...props
}: React.ComponentProps<"fieldset">) => {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Shadcn UI の FieldLegendコンポーネント
 * 凡例要素。labelラベルのサイズに合わせてバリアントを切り替える。
 * @returns legend要素
 */
const FieldLegend = ({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) => {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Shadcn UI の FieldGroupコンポーネント
 * @returns field群のラップコンポーネント
 */
const FieldGroup = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
};

const fieldVariants = cva(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
        responsive: [
          "flex-col @md/field-group:flex-row @md/field-group:items-center [&>*]:w-full @md/field-group:[&>*]:w-auto [&>.sr-only]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

/**
 * Shadcn UI の Fieldコンポーネント
 * 単一フィールドのコアラッパー。方向制御、無効状態のスタイル設定、および間隔調整機能を提供する。
 * @returns フィールドのラップコンポーネント
 */
const Field = ({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) => {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
};

/**
 * Shadcn UI の FieldContentコンポーネント
 * ラベルがコントロールの横にある場合に、コントロールと説明をグループ化するフレックス列。説明がない場合は不要。
 * @returns コントロールと説明をラップするコンポーネント
 */
const FieldContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Shadcn UI の FieldLabelコンポーネント
 * ラベルは、直接入力要素とネストされたField子要素の両方に対応するようにスタイル設定される。
 * @returns label要素
 */
const FieldLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof Label>) => {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border *:data-[slot=field]:p-4",
        "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Shadcn UI の FieldTitleコンポーネント
 * ラベルスタイルを内部に含んだタイトルを表示する。
 * @returns フィールドのタイトル
 */
const FieldTitle = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Shadcn UI の FieldDescriptionコンポーネント
 * 横並びのレイアウトで長い行のバランスを自動的に調整するヘルパーテキストスロット。
 * @returns フィールドの説明
 */
const FieldDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-sm leading-normal font-normal text-muted-foreground group-has-[data-orientation=horizontal]/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Shadcn UI の FieldSeparator コンポーネント
 * 要素内のセクションを区切る視覚的な区切り線。オプションでインラインコンテンツを受け入れることができます。
 * @returns 区切り線
 */
const FieldSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) => {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
};

/**
 * Shadcn UI の FieldErrorコンポーネント
 * 子要素または配列を受け入れるアクセス可能なエラーコンテナ
 * @returns フィールドのエラーメッセージを表示するコンポーネント
 */
const FieldError = ({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) => {
  const content = useMemo(() => {
    if (children) {
      if (typeof children === "string") {
        return `*${children}`;
      }
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length == 1) {
      const msg = uniqueErrors[0]?.message;
      return msg ? `*${msg}` : null;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>*{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
};

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle
};

