import { useQuery } from "@tanstack/react-query";

import getLatestActiveKeySchema from "@/app/api/security/get-latest-active-key/schema";
import requests from "@/lib/requests";

import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getFrameworks } from "./frameworks";

interface FrameworkIntegrationTabsProps {
  placeId: string | null;
}

export function FrameworkIntegrationTabs({
  placeId,
}: FrameworkIntegrationTabsProps) {
  const apiKeyQuery = useQuery({
    queryKey: ["apiKey"],
    queryFn: async () => {
      const { apiKey } = await requests.get(getLatestActiveKeySchema);
      return apiKey;
    },
    meta: {
      errorMessage: "Failed to fetch API key",
    },
  });

  const apiKey = apiKeyQuery.data ?? null;
  const frameworks = getFrameworks(placeId, apiKey);

  return (
    <Tabs defaultValue="nextjs" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        {frameworks.map((framework) => (
          <TabsTrigger key={framework.id} value={framework.id}>
            {framework.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {frameworks.map((framework) => (
        <TabsContent
          key={framework.id}
          value={framework.id}
          className="space-y-4"
        >
          <div className="p-4 rounded-lg">
            <p className="text-sm">{framework.description}</p>
          </div>

          <CodeBlock
            theme="light"
            code={framework.code}
            language={framework.id === "hugo" ? "html" : "javascript"}
            title={`${framework.name} Integration`}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
