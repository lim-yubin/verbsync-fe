import { useState } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ApiKeyDisplayProps {
  apiKey: string;
}

export function ApiKeyDisplay({ apiKey }: ApiKeyDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("API Key가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("복사에 실패했습니다");
    }
  };

  const displayValue = isVisible ? apiKey : "•".repeat(apiKey.length);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">API Key</Label>
          <p className="text-sm text-muted-foreground mt-1">
            이 키를 사용하여 번역 데이터를 가져올 수 있습니다
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={displayValue}
              readOnly
              className="pr-24 font-mono text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-muted p-3">
          <p className="text-xs font-mono text-muted-foreground">
            GET https://api.verbasync.com/public/{apiKey}/locales/ko.json
          </p>
        </div>
      </div>
    </Card>
  );
}

