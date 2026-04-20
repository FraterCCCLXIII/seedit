import { type ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';
import styles from './settings-section.module.css';

export function SettingsPage({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}

export function SettingsPageActions({ children }: { children: ReactNode }) {
  return <div className={styles.pageActions}>{children}</div>;
}

export type SettingsSectionProps = {
  title: string;
  id?: string;
  highlighted?: boolean;
  children: ReactNode;
};

export const SettingsSection = ({ title, id, highlighted, children }: SettingsSectionProps) => {
  const autoHeadingId = useId();
  const headingId = id ? `${id}-heading` : autoHeadingId;

  return (
    <section id={id} className={cn(styles.section, highlighted && styles.sectionHighlighted)} aria-labelledby={headingId}>
      <div className={styles.sectionInner}>
        <h2 id={headingId} className={styles.sectionLabel}>
          {title}
        </h2>
        <div className={styles.sectionBody}>{children}</div>
      </div>
    </section>
  );
};
