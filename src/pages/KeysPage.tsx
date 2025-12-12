import { useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Hash } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useKeys, useCreateKey } from "@/hooks/useKeys";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function KeysPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyDescription, setKeyDescription] = useState("");

  const { data: keys, isLoading } = useKeys(projectId!);
  const { mutate: createKey, isPending: isCreating } = useCreateKey(projectId!);

  const handleCreate = () => {
    if (!keyName) {
      toast.error("키 이름을 입력해주세요");
      return;
    }

    createKey(
      { name: keyName, description: keyDescription || undefined },
      {
        onSuccess: () => {
          toast.success("번역 키가 추가되었습니다");
          setDialogOpen(false);
          setKeyName("");
          setKeyDescription("");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "키 추가에 실패했습니다");
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="번역 키"
          description="번역에 사용할 키를 관리하세요"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              키 추가
            </Button>
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : !keys || keys.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">번역 키가 없습니다</p>
              <p className="text-sm text-muted-foreground">
                첫 번째 번역 키를 추가해보세요
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <Card key={key.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-mono font-semibold">{key.name}</h3>
                    </div>
                    {key.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {key.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      {formatDistanceToNow(new Date(key.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 키 추가 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 번역 키 추가</DialogTitle>
            <DialogDescription>
              번역에 사용할 키를 추가하세요 (예: login.title, home.hero.subtitle)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                키 이름 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="login.title"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                점(.)으로 구분된 키 이름을 사용하세요
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                placeholder="로그인 페이지의 제목"
                value={keyDescription}
                onChange={(e) => setKeyDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "추가 중..." : "추가"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

