"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Table2,
  ShieldCheck,
  ArrowRightLeft,
  CheckCircle2,
  Globe,
  Code,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const features = [
  {
    icon: Zap,
    title: "배포 없는 실시간 업데이트",
    description: "코드 수정 없이 대시보드에서 번역을 즉시 반영",
  },
  {
    icon: Table2,
    title: "엑셀처럼 편한 UI",
    description: "직관적인 테이블 인터페이스로 모든 번역을 한눈에",
  },
  {
    icon: ArrowRightLeft,
    title: "i18next 완벽 호환",
    description: "기존 설정 그대로, 엔드포인트만 변경하면 끝",
  },
  {
    icon: ShieldCheck,
    title: "강력한 보안",
    description: "도메인 제한 및 API Key 기반 안전한 접근 제어",
  },
];

export function AuthHero() {
  return (
    <div className="relative w-full flex h-full flex-col p-8 lg:p-12 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Logo width={48} height={48} className="shrink-0" />
          </motion.div>
          <span className="text-2xl font-bold tracking-tight">Verbsync</span>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-primary">
                개발자를 위한 스마트한 i18n 플랫폼
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-5xl leading-tight">
              번역 업데이트
              <br />
              <span className="text-primary">배포 없이</span> 즉시 반영
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              JSON 파일을 직접 수정하고 커밋하던 시대는 끝났습니다.
              <br />
              Verbsync로 코드 수정 없이 실시간으로 다국어를 관리하세요.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group flex flex-col gap-2 rounded-lg border bg-card/60 backdrop-blur-sm p-3 transition-all hover:border-primary/50 hover:bg-card/80"
              >
                <motion.div
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary/20"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="h-4 w-4" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-snug">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10 mt-auto pt-6"
      >
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { icon: CheckCircle2, text: "무료 시작", color: "text-green-500" },
            { icon: Globe, text: "다국어 지원", color: "text-blue-500" },
            {
              icon: ShieldCheck,
              text: "도메인 보안",
              color: "text-purple-500",
            },
            { icon: Code, text: "API 우선", color: "text-orange-500" },
          ].map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center gap-1.5 rounded-full bg-card/60 backdrop-blur-sm px-3 py-1.5 border"
            >
              <item.icon className={`h-3 w-3 ${item.color}`} />
              <span className="text-muted-foreground font-medium">
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
