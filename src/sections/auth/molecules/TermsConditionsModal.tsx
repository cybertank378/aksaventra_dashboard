"use client";

import {
  AUTH_MODAL_TOPICS,
  type AuthModalTopic,
  type TermsSectionItem,
} from "@/sections/auth/atoms/terms";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import { Modal } from "@/shared-ui/component/Modal";

export interface TermsConditionsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
  topic?: AuthModalTopic;
  onTopicChange?: (topic: AuthModalTopic) => void;
}

const TOPIC_KEYS: AuthModalTopic[] = ["privacy", "sla", "api-docs", "support"];

export default function TermsConditionsModal({
  open,
  onClose,
  onAccept,
  topic = "sla",
  onTopicChange,
}: TermsConditionsModalProps) {
  const activeContent = AUTH_MODAL_TOPICS[topic];

  const handleSubmit = () => {
    onAccept?.();
    onClose();
  };

  const handleSelectPrivacy = () => {
    onTopicChange?.("privacy");
  };

  const handleSelectSla = () => {
    onTopicChange?.("sla");
  };

  const handleSelectApiDocs = () => {
    onTopicChange?.("api-docs");
  };

  const handleSelectSupport = () => {
    onTopicChange?.("support");
  };

  const topicHandlers: Record<AuthModalTopic, () => void> = {
    privacy: handleSelectPrivacy,
    sla: handleSelectSla,
    "api-docs": handleSelectApiDocs,
    support: handleSelectSupport,
  };

  return (
    <Modal
      open={open}
      title={activeContent.title}
      subtitle={activeContent.subtitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={onAccept ? "Saya Setuju & Mengerti" : "Mengerti"}
      cancelText="Tutup"
      submitColor="primary"
      size="lg"
    >
      <div className="space-y-4">
        {/* TOPIC SWITCHER TABS */}
        {onTopicChange && (
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100/80 p-1.5 sm:grid-cols-4">
            {TOPIC_KEYS.map((itemKey) => {
              const item = AUTH_MODAL_TOPICS[itemKey];
              const isActive = itemKey === topic;
              return (
                <Button
                  key={itemKey}
                  variant={isActive ? "filled" : "text"}
                  color={isActive ? "primary" : "secondary"}
                  size="sm"
                  onClick={topicHandlers[itemKey]}
                  className={
                    isActive
                      ? "!rounded-lg !bg-indigo-600 !py-1.5 text-xs font-bold !text-white shadow-2xs"
                      : "!rounded-lg !py-1.5 text-xs font-semibold !text-slate-600 hover:!bg-white/80"
                  }
                >
                  {item.tabLabel}
                </Button>
              );
            })}
          </div>
        )}

        {/* BANNER */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
          <span className="text-xs font-semibold text-indigo-950">{activeContent.bannerText}</span>
          <Badge
            color="info"
            variant="soft"
            className="rounded-md border border-indigo-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-indigo-700"
          >
            {activeContent.badge}
          </Badge>
        </div>

        {/* SECTIONS */}
        <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
          {activeContent.sections.map((section: TermsSectionItem) => (
            <div
              key={section.id}
              className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
                {section.code && (
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-600">
                    {section.code}
                  </span>
                )}
              </div>

              <p className="text-xs leading-relaxed text-slate-600">{section.content}</p>

              {section.points && section.points.length > 0 && (
                <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}

              {section.codeSnippet && (
                <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-emerald-400">
                  <code>{section.codeSnippet}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
