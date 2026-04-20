import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Author, useBlock } from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { isProfileHiddenView } from '../../../../lib/utils/view-utils';
import commentToolsStyles from '../comment-tools.module.css';
import styles from './hide-menu.module.css';

type ReplyPermalinkInMenu = { mode: 'failed' } | { mode: 'link'; to: string };

type HideMenuProps = {
  author?: Author | undefined;
  cid?: string;
  isAccountMod?: boolean;
  isAuthor?: boolean;
  replyPermalink?: ReplyPermalinkInMenu;
  toggleIsMenuOpen?: () => void;
  subplebbitAddress?: string;
};

const BlockAuthorButton = ({ author, toggleIsMenuOpen }: HideMenuProps) => {
  const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: author?.address });

  return (
    <div
      role='menuitem'
      className={styles.menuItem}
      onClick={() => {
        (blocked ? unblock : block)();
        if (toggleIsMenuOpen) toggleIsMenuOpen();
      }}
    >
      {blocked ? `${t('unblock')}` : `${t('block')}`} u/{author?.shortAddress}
    </div>
  );
};

const BlockSubplebbitButton = ({ subplebbitAddress }: HideMenuProps) => {
  const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: subplebbitAddress });

  return (
    <div role='menuitem' className={styles.menuItem} onClick={blocked ? unblock : block}>
      {blocked ? `${t('unblock')}` : `${t('block')}`} s/{subplebbitAddress && Plebbit.getShortAddress({ address: subplebbitAddress })}
    </div>
  );
};

const BlockCommentButton = ({ cid, toggleIsMenuOpen }: HideMenuProps) => {
  const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ cid });

  return (
    <div
      role='menuitem'
      className={styles.menuItem}
      onClick={() => {
        if (blocked) {
          unblock();
        } else {
          block();
        }
        toggleIsMenuOpen?.();
      }}
    >
      {blocked ? `${t('unhide')}` : `${t('hide')}`} {t('post')}
    </div>
  );
};

const HideMenu = ({ author, cid, isAccountMod, isAuthor, replyPermalink, subplebbitAddress }: HideMenuProps) => {
  const { t } = useTranslation();
  const [isHideMenuOpen, setIsHideMenuOpen] = useState(false);

  const isInProfileHiddenView = isProfileHiddenView(useLocation().pathname);
  const { unblock } = useBlock({ cid });

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-end',
    open: isHideMenuOpen,
    onOpenChange: setIsHideMenuOpen,
    middleware: [offset(4), flip({ fallbackAxisSideDirection: 'end' }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const menuPanelId = useId();

  if (isInProfileHiddenView) {
    return (
      <li className={styles.profileHiddenItem}>
        <span onClick={unblock}>{t('unhide')}</span>
      </li>
    );
  }

  return (
    <>
      <li className={`${commentToolsStyles.overflowToolSlot} ${styles.overflowLi}`}>
        <button
          type='button'
          ref={refs.setReference}
          className={styles.kebabButton}
          aria-label={t('post_more_menu')}
          disabled={!cid}
          {...(cid ? getReferenceProps() : {})}
          aria-controls={cid ? menuPanelId : undefined}
        >
          <span className={styles.kebabIcon} aria-hidden>
            ⋮
          </span>
        </button>
      </li>
      {isHideMenuOpen && cid && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              id={menuPanelId}
              className={styles.dropdown}
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <div className={styles.menu}>
                {replyPermalink ? (
                  replyPermalink.mode === 'failed' ? (
                    <div role='menuitem' className={styles.menuItem} aria-disabled>
                      {t('permalink')}
                    </div>
                  ) : (
                    <Link
                      role='menuitem'
                      className={styles.menuItem}
                      to={replyPermalink.to}
                      onClick={(e) => {
                        if (!cid) e.preventDefault();
                        setIsHideMenuOpen(false);
                      }}
                    >
                      {t('permalink')}
                    </Link>
                  )
                ) : null}
                <BlockCommentButton cid={cid} toggleIsMenuOpen={() => setIsHideMenuOpen(false)} />
                {subplebbitAddress ? <BlockSubplebbitButton subplebbitAddress={subplebbitAddress} /> : null}
                {author?.address ? <BlockAuthorButton author={author} toggleIsMenuOpen={() => setIsHideMenuOpen(false)} /> : null}
                {!isAccountMod && !isAuthor ? (
                  <div role='menuitem' className={styles.menuItem}>
                    {t('report')}
                  </div>
                ) : null}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

export default HideMenu;
