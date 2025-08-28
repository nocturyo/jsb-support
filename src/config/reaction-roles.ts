export type ReactionRole = {
  emoji: string;     // '6️⃣' lub '🔥' albo ID custom emoji np. '123456789012345678'
  roleId: string;    // ID roli do nadania
  label: string;     // opis do embeda (np. "Rainbow6Siege")
};

export const REACTION_ROLES: ReactionRole[] = [
  { emoji: '1407719138331332739', roleId: '1407890669099286609',  label: 'Copper' },
  { emoji: '1407719152243839099', roleId: '1407890801555669022', label: 'Bronze' },
  { emoji: '1407719167062184036', roleId: '1407890838729523220', label: 'Silver' },
  { emoji: '1407719177392754748', roleId: '1407890862850969681', label: 'Gold' },
  { emoji: '1407719213115641969', roleId: '1407890942148739235', label: 'Platinum' },
  { emoji: '1407719351045460109', roleId: '1407891215688532138', label: 'Emerald' },
  { emoji: '1407719306485170176', roleId: '1407890965741568093', label: 'Diamond' },
  { emoji: '1407719364202987633', roleId: '1407890984754221066', label: 'Champion' },
];
