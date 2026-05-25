export const siteFeatures = {
  followEnabled: true,
  pushNotificationsEnabled: false,
  premiumEnabled: false,
  unfilteredEnabled: false,
  letterRequestsEnabled: false,
} as const;

export function isPremiumExperienceEnabled() {
  return siteFeatures.premiumEnabled;
}
