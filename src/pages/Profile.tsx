import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { Card, Badge, Progress, Stat, cx } from "../components/ui";
import { badges as defaultBadges, skillRadar as defaultSkillRadar } from "../lib/data";
import { useAuth } from "../lib/auth";
import { progress, type ProfileResponse, type BadgeResponse } from "../lib/api";

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    progress.profile()
      .then((data) => {
        if (mounted) setProfileData(data);
      })
      .catch((err) => {
        console.warn("Failed to load live progress profile:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Compute initials and user attributes
  const initials = user?.avatar_initials || (user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "QP");

  const name = user?.name || "Quantum Explorer";
  const email = user?.email || "user@qubitlab.dev";
  const level = user?.current_level || 1;
  const experienceLevel = user?.experience_level
    ? user.experience_level.charAt(0).toUpperCase() + user.experience_level.slice(1)
    : "Beginner";
  const xp = user?.xp != null ? user.xp.toLocaleString() : "0";
  const streak = user?.streak ?? 0;

  // Use live data if available, otherwise defaults
  const radarData = profileData?.skill_radar && profileData.skill_radar.length > 0
    ? profileData.skill_radar
    : defaultSkillRadar;

  const badgeList: (BadgeResponse | { name: string; tone: "cyan" | "blue" | "violet" | "magenta"; earned: boolean; desc: string })[] =
    profileData?.badges && profileData.badges.length > 0
      ? profileData.badges
      : defaultBadges;

  const conceptList = (profileData?.strongest_concepts && profileData.strongest_concepts.length > 0)
    ? [
        ...profileData.strongest_concepts.map((c) => [c.name, c.value, "cyan" as const]),
        ...(profileData.weakest_concepts || []).map((c) => [c.name, c.value, "violet" as const]),
      ]
    : [
        ["Quantum Gates", 0, "cyan" as const],
        ["Superposition", 0, "cyan" as const],
        ["Optimization", 0, "violet" as const],
        ["Quantum ML", 0, "violet" as const],
      ];

  const projectsCount = (profileData?.stats?.projects_completed as string | number) ?? "0";
  const challengesCount = (profileData?.stats?.challenges_completed as string | number) ?? "0";
  const avgScore = (profileData?.stats?.avg_score as string | number) ?? "—";

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
      {/* header */}
      <Card className="relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 grid-field opacity-40" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[linear-gradient(120deg,#4d7cfe,#9b6bff)] font-display text-2xl font-800 text-white shadow-lg shadow-quantum-blue/20">
            {initials}
          </div>
          <div>
            <h1 className="font-display text-2xl font-800 tracking-tight">{name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone="violet">Level {level} · {experienceLevel}</Badge>
              <span className="text-[13px] text-txt-dim">{email}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-6 text-center">
            <div>
              <div className="font-display text-2xl font-800 text-txt">{xp}</div>
              <div className="text-[11px] text-txt-faint uppercase tracking-wider">Total XP</div>
            </div>
            <div>
              <div className="font-display text-2xl font-800 text-warn">{streak} 🔥</div>
              <div className="text-[11px] text-txt-faint uppercase tracking-wider">Streak</div>
            </div>
            <div>
              <div className="font-display text-2xl font-800 text-quantum-cyan">#{level > 1 ? 6 : 1}</div>
              <div className="text-[11px] text-txt-faint uppercase tracking-wider">Rank</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* skill radar */}
        <Card className="p-5">
          <h2 className="font-display text-lg font-700">Quantum skill radar</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "#9aa3ba", fontSize: 12 }} />
                <Radar dataKey="value" stroke="#35e0d8" fill="#35e0d8" fillOpacity={0.22} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* stats */}
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Projects completed" value={projectsCount} />
          <Stat label="Challenges completed" value={challengesCount} />
          <Stat label="Average score" value={avgScore} delta="+4% this month" />
          <Stat label="Best league" value={level > 2 ? "Gold" : level > 1 ? "Silver" : "Bronze"} />
          <Card className="col-span-2 p-4">
            <div className="text-[12px] uppercase tracking-wide text-txt-faint">Strongest & weakest concepts</div>
            <div className="mt-3 space-y-2.5">
              {conceptList.map(([k, v, t]) => (
                <div key={k as string}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="text-txt-dim">{k}</span>
                    <span className="text-txt">{v}%</span>
                  </div>
                  <Progress value={v as number} tone={t as any} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* badges */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-700">Achievements</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {badgeList.map((b) => (
            <Card key={b.name} className={cx("flex flex-col items-center p-4 text-center", !b.earned && "opacity-45")}>
              <div className={cx(
                "grid h-14 w-14 place-items-center rounded-2xl border text-2xl transition-transform hover:scale-105",
                b.earned
                  ? "border-quantum-cyan/40 bg-[radial-gradient(circle,rgba(53,224,216,0.2),transparent)] text-quantum-cyan"
                  : "border-line-strong bg-ink-900 text-txt-faint"
              )}>
                {b.earned ? "◈" : "🔒"}
              </div>
              <div className="mt-3 text-[13px] font-600">{b.name}</div>
              <div className="mt-1 text-[11px] text-txt-faint">{b.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
