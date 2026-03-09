import { cn } from "@/lib/utils";

interface InfoTabProps {
  activeTab: string;
  currentFont: any;
  supportedFeatures: Set<string>;
  variants: any[];
}

export function InfoTab({
  activeTab,
  currentFont,
  supportedFeatures,
  variants,
}: InfoTabProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-5xl p-12",
        activeTab !== "info" && "hidden"
      )}
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
            Font Information
          </h3>
          <div className="bg-card rounded-lg border p-6">
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Family Name
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {currentFont.family}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Subfamily
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {currentFont.subfamily}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Full Name
                </dt>
                <dd className="mt-1 text-sm">{currentFont.full_name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  PostScript Name
                </dt>
                <dd className="mt-1 text-sm">{currentFont.postscript_name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Version
                </dt>
                <dd className="mt-1 text-sm">
                  {currentFont.version || "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Copyright
                </dt>
                <dd className="mt-1 text-sm">
                  {currentFont.copyright || "None"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  File Path
                </dt>
                <dd className="mt-1 text-sm break-all">
                  {currentFont.file_path}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  File Format
                </dt>
                <dd className="mt-1 text-sm uppercase">
                  {currentFont.file_path.split(".").pop()}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Category
                </dt>
                <dd className="mt-1 text-sm">
                  {currentFont.category || "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Subcategory
                </dt>
                <dd className="mt-1 text-sm">
                  {currentFont.subcategory || "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Supported Features
                </dt>
                <dd className="mt-1 text-sm">
                  {supportedFeatures.size} features
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-mono text-xs">
                  Variants
                </dt>
                <dd className="mt-1 text-sm">{variants.length} styles</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
