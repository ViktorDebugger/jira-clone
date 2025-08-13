import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Member } from "../types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SettingsIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent } from "@/components/ui/card";
import { MemberAvatar } from "./member-avatar";
import { useCurrent } from "@/features/auth/api/use-current";

interface MemberListProps {
  data: Member[];
  total: number;
}

export const MemberList = ({ data, total }: MemberListProps) => {
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();

  if (!user) return;

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Members ({total})</p>
          <Button variant={"secondary"} size={"icon"} asChild>
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.map((member) => (
            <li key={member.$id}>
              <Card className="shadow-none rounded-lg overflow-hidden p-2">
                <CardContent className="p-3 flex flex-col items-center gap-x-2">
                  <MemberAvatar name={member.name} className="size-12" />
                  <div className="flex flex-col items-center overflow-hidden mx-2 pt-2 space-y-1 min-w-0">
                    <p className="text-lg font-medium text-center truncate w-full">
                      {member.name}{" "}
                      {member.email === user.email && (
                        <span className="text-muted-foreground text-sm">
                          (You)
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-muted-foreground text-center truncate w-full">
                      {member.email}
                    </p>

                    <p className="text-sm text-muted-foreground text-center truncate w-full">
                      {member.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          <li className="text-sm col-span-1 lg:col-span-2 text-muted-foreground text-center hidden first-of-type:block">
            No members found
          </li>
        </ul>
      </div>
    </div>
  );
};
