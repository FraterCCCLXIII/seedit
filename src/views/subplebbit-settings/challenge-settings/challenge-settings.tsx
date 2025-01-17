import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isCreateSubplebbitView } from '../../../lib/utils/view-utils';
import useSubplebbitSettingsStore, { SubplebbitSettingsState } from '../../../stores/use-subplebbit-settings-store';
import useChallengesOptions from '../../../hooks/use-challenges-options';
import styles from '../subplebbit-settings.module.css';

interface ChallengeSettingsProps {
  challenge: any;
  index: number;
  isReadOnly: boolean;
  setSubplebbitSettingsStore: (data: Partial<SubplebbitSettingsState>) => void;
  settings: any;
  showSettings: boolean;
  challengesSettings: any;
}

type OptionInput = {
  option: string;
  label: string;
  default?: string;
  description: string;
  placeholder?: string;
  required?: boolean;
};

type Exclude = {
  postScore?: number;
  replyScore?: number;
  firstCommentTimestamp?: number;
  challenges?: number[];
  post?: boolean;
  reply?: boolean;
  vote?: boolean;
  role?: string[];
  address?: string[];
  rateLimit?: number;
  rateLimitChallengeSuccess?: boolean;
};

const rolesToExclude = ['moderator', 'admin', 'owner'];
const actionsToExclude: Array<'post' | 'reply' | 'vote'> = ['post', 'reply', 'vote'];
const nonActionsToExclude: Array<'not post' | 'not reply' | 'not vote'> = ['not post', 'not reply', 'not vote'];

const ExcludeAddressesFromChallengeInput = ({
  exclude,
  excludeIndex,
  handleExcludeAddress,
  isReadOnly,
}: {
  exclude: any;
  excludeIndex: number;
  handleExcludeAddress: (index: number, value: string) => void;
  isReadOnly: boolean;
}) => {
  const [addressInput, setAddressInput] = useState(exclude?.address?.join(', ') || '');

  return isReadOnly ? (
    <span>{exclude?.address?.join(', ')}</span>
  ) : (
    <input
      type='text'
      placeholder='address1.eth, address2.eth, address3.eth'
      value={addressInput}
      onChange={(e) => {
        const newValue = e.target.value;
        setAddressInput(newValue);
        handleExcludeAddress(excludeIndex, newValue);
      }}
    />
  );
};

const ChallengeSettings = ({ challenge, challengesSettings, index, isReadOnly, setSubplebbitSettingsStore, settings, showSettings }: ChallengeSettingsProps) => {
  const { name, options } = challenge || {};
  const challengeSettings = challengesSettings[name];
  const readOnlyFallback = isReadOnly && Object.keys(challengeSettings || {}).length === 0 && challenge;

  const excludeArray = Array.isArray(challenge?.exclude) ? challenge.exclude : [];

  const handleOptionChange = (optionName: string, newValue: string) => {
    const updatedOptions = { ...options, [optionName]: newValue };
    const updatedChallenges = settings.challenges?.map((ch: any, idx: number) => (idx === index ? { ...ch, options: updatedOptions } : ch));
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const addExcludeGroup = () => {
    const newExclude = { role: [], post: false, reply: false, vote: false };
    if (challenge?.exclude) {
      const updatedChallenges = settings?.challenges?.map((ch: any, idx: number) => (idx === index ? { ...ch, exclude: [...ch.exclude, newExclude] } : ch));
      setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
      setShowExcludeSettings((oldShowExcludeSettings) => [...oldShowExcludeSettings, true]);
    } else {
      const updatedChallenges = settings?.challenges?.map((ch: any, idx: number) => (idx === index ? { ...ch, exclude: [newExclude] } : ch));
      setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
      setShowExcludeSettings([true]);
    }
  };

  const deleteExcludeGroup = (excludeIndex: number) => {
    const updatedChallenges = [...settings.challenges];
    const currentChallenge = updatedChallenges[index];
    currentChallenge.exclude.splice(excludeIndex, 1);
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const [showExcludeSettings, setShowExcludeSettings] = useState<boolean[]>([]);
  const toggleExcludeSettings = (excludeIndex: number) => {
    const newShowExcludeSettings = [...showExcludeSettings];
    newShowExcludeSettings[excludeIndex] = !newShowExcludeSettings[excludeIndex];
    setShowExcludeSettings(newShowExcludeSettings);
  };

  const handleExcludeChange = (excludeIndex: number, type: keyof Exclude | 'not post' | 'not reply' | 'not vote', value: any) => {
    const updatedChallenges = settings.challenges?.map((ch: any, idx: number) => {
      if (idx === index) {
        const updatedExclude = ch.exclude?.map((ex: any, exIdx: number) => {
          if (exIdx === excludeIndex) {
            let newEx = { ...ex };

            switch (type) {
              case 'rateLimit':
              case 'postScore':
              case 'replyScore':
                const parsedValue = parseInt(value, 10);
                if (!isNaN(parsedValue)) {
                  newEx[type] = parsedValue;
                }
                break;
              case 'not post':
                newEx.post = value ? undefined : false;
                break;
              case 'not reply':
                newEx.reply = value ? undefined : false;
                break;
              case 'not vote':
                newEx.vote = value ? undefined : false;
                break;
              case 'role':
                if (typeof value === 'string') {
                  const roleIndex = newEx.role.indexOf(value);
                  if (roleIndex > -1) {
                    newEx.role.splice(roleIndex, 1);
                  } else {
                    newEx.role.push(value);
                  }
                }
                break;
              default:
                newEx[type] = value;
            }
            return newEx;
          }
          return ex;
        });
        return { ...ch, exclude: updatedExclude };
      }
      return ch;
    });

    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const handleExcludeAddress = (excludeIndex: number, value: string) => {
    const addresses = value
      .split(',')
      .map((addr) => addr.trim())
      .filter((addr) => addr !== '');

    handleExcludeChange(excludeIndex, 'address', addresses.length > 0 ? addresses : undefined);
  };

  return (
    <div className={showSettings || isReadOnly ? styles.visible : styles.hidden}>
      {isReadOnly ? (
        <>
          <div className={styles.readOnlyChallengeType}>type: {(challengeSettings?.type || readOnlyFallback?.type) ?? 'unknown'}</div>
          <div className={styles.readOnlyChallengeDescription}>{challengeSettings?.description || readOnlyFallback?.description || ''}</div>
        </>
      ) : (
        <div className={styles.challengeDescription}>{challengeSettings?.description}</div>
      )}
      {challengeSettings?.optionInputs?.map((setting: OptionInput) => (
        <div key={setting?.option} className={styles.challengeOption}>
          <div className={styles.challengeOptionLabel}>{setting?.label}</div>
          <div className={styles.challengeOptionDescription}>
            {setting?.description} {setting?.default && `(default: "${setting?.default}")`}
          </div>
          {isReadOnly ? (
            <span>{options && (options[setting?.option] || '')}</span>
          ) : (
            <input
              type='text'
              value={options && (options[setting?.option] || '')}
              placeholder={setting?.placeholder || ''}
              onChange={(e) => handleOptionChange(setting?.option, e.target.value)}
            />
          )}
        </div>
      ))}
      <div className={styles.challengeDescription}>Exclude groups for challenge #{index + 1}</div>
      <div className={styles.excludeGroupSection}>
        {!isReadOnly && (
          <button className={`${styles.addButton} ${styles.addExclude}`} onClick={addExcludeGroup} disabled={isReadOnly}>
            Add Group
          </button>
        )}
        {excludeArray.map((exclude: any, excludeIndex: number) => (
          <div key={excludeIndex} className={styles.excludeGroup}>
            Exclude group #{excludeIndex + 1}
            {!isReadOnly && <span className={styles.deleteButton} onClick={() => deleteExcludeGroup(excludeIndex)} title='delete group' />}
            {!isReadOnly && (
              <button className={styles.hideCombo} onClick={() => toggleExcludeSettings(excludeIndex)} disabled={isReadOnly}>
                {showExcludeSettings?.[excludeIndex] ?? false ? 'Hide' : 'Show'} Group Settings
              </button>
            )}
            {showExcludeSettings[excludeIndex] && (
              <>
                {isReadOnly && !exclude?.address ? null : (
                  <div className={styles.challengeOption}>
                    User's address
                    <div className={styles.challengeOptionDescription}>Is one of the following:</div>
                    <ExcludeAddressesFromChallengeInput
                      exclude={exclude}
                      excludeIndex={excludeIndex}
                      handleExcludeAddress={handleExcludeAddress}
                      isReadOnly={isReadOnly}
                    />
                  </div>
                )}
                {isReadOnly && !(exclude?.postScore || exclude?.replyScore) ? null : (
                  <div className={styles.challengeOption}>
                    User's karma
                    {isReadOnly && !exclude?.postScore ? null : (
                      <>
                        <div className={styles.challengeOptionDescription}>Post karma is at least:</div>
                        {isReadOnly ? (
                          <span>{exclude?.postScore}</span>
                        ) : (
                          <input type='text' value={exclude?.postScore || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'postScore', e.target.value)} />
                        )}
                      </>
                    )}
                    {isReadOnly && !exclude?.replyScore ? null : (
                      <>
                        <div className={styles.challengeOptionDescription}>Comment karma is at least:</div>
                        {isReadOnly ? (
                          <span>{exclude?.replyScore}</span>
                        ) : (
                          <input type='text' value={exclude?.replyScore || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'replyScore', e.target.value)} />
                        )}
                      </>
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.firstCommentTimestamp ? null : (
                  <div className={styles.challengeOption}>
                    User's account age
                    <div className={styles.challengeOptionDescription}>In seconds (eg. 86400 = 24h) is at least:</div>
                    {isReadOnly ? (
                      <span>{exclude?.firstCommentTimestamp}</span>
                    ) : (
                      <input
                        type='text'
                        value={exclude?.firstCommentTimestamp || undefined}
                        onChange={(e) => handleExcludeChange(excludeIndex, 'firstCommentTimestamp', e.target.value)}
                      />
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.role ? null : (
                  <div className={styles.challengeOption}>
                    User's role
                    <div className={styles.challengeOptionDescription}>Is any of the following:</div>
                    {rolesToExclude?.map((role) =>
                      isReadOnly && !exclude?.role?.includes(role) ? null : (
                        <div key={role}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyRoleExclude}>{role} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.role?.includes(role)}
                                onChange={() => handleExcludeChange(excludeIndex, 'role', role)}
                                disabled={isReadOnly}
                              />
                              is {role}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
                {isReadOnly && !actionsToExclude.some((action) => exclude[action] === true) ? null : (
                  <div className={styles.challengeOption}>
                    User's action
                    <div className={styles.challengeOptionDescription}>Is all of the following:</div>
                    {actionsToExclude?.map((action) =>
                      isReadOnly && !exclude?.[action] ? null : (
                        <div key={action}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyActionExclude}>{action} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.[action]}
                                onChange={(e) => handleExcludeChange(excludeIndex, action, e.target.checked)}
                                disabled={isReadOnly}
                              />
                              is {action}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                    {nonActionsToExclude?.map((nonAction) =>
                      isReadOnly && exclude?.[nonAction.replace('not ', '')] !== null ? null : (
                        <div key={nonAction}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyActionExclude}>{nonAction} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.[nonAction.replace('not ', '')] === undefined}
                                onChange={(e) => handleExcludeChange(excludeIndex, nonAction, e.target.checked)}
                                disabled={isReadOnly}
                              />
                              is {nonAction}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.rateLimit ? null : (
                  <div className={styles.challengeOption}>
                    Rate limit
                    <div className={styles.challengeOptionDescription}>Number of free user actions per hour:</div>
                    {isReadOnly ? (
                      <div>{exclude?.rateLimit}</div>
                    ) : (
                      <input type='text' value={exclude?.rateLimit || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'rateLimit', e.target.value)} />
                    )}
                    {isReadOnly && !exclude?.rateLimitChallengeSuccess ? null : (
                      <div>
                        <label>
                          <input
                            type='checkbox'
                            checked={exclude?.rateLimitChallengeSuccess === true}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', e.target.checked);
                              } else {
                                handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', undefined);
                              }
                            }}
                            disabled={isReadOnly}
                          />
                          apply rate limit only on challenge success
                        </label>
                        <label className={styles.rateLimitChallengeFail}>
                          <input
                            type='checkbox'
                            checked={exclude?.rateLimitChallengeSuccess === false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', false);
                              } else {
                                handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', undefined);
                              }
                            }}
                            disabled={isReadOnly}
                          />
                          apply rate limit only on challenge fail
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Challenges = ({
  isReadOnly,
  readOnlyChallenges,
  challengeNames,
  challengesSettings,
}: {
  isReadOnly: boolean;
  readOnlyChallenges: any;
  challengeNames: string[];
  challengesSettings: any;
}) => {
  const { t } = useTranslation();
  const { settings, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const location = useLocation();
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const challenges = settings?.challenges || readOnlyChallenges || [];
  const [showSettings, setShowSettings] = useState<boolean[]>(challenges?.map(() => false));
  const challengeOptions = useChallengesOptions();

  const hasSetDefaultChallenge = useRef(false);
  const valuesRef = useRef({ settings, setSubplebbitSettingsStore });

  useEffect(() => {
    valuesRef.current = { settings, setSubplebbitSettingsStore };
  });

  useEffect(() => {
    if (isInCreateSubplebbitView && !hasSetDefaultChallenge.current && challengeOptions && challengesSettings && !valuesRef.current.settings?.challenges?.length) {
      const defaultChallengeName = challengesSettings?.['captcha-canvas-v3'] ? 'captcha-canvas-v3' : challengeNames?.[0] || Object.keys(challengeOptions)[0];
      console.log('Setting default challenge:', defaultChallengeName);
      const defaultChallenge = {
        name: defaultChallengeName,
        options: challengeOptions[defaultChallengeName] || {},
      };

      valuesRef.current.setSubplebbitSettingsStore({
        settings: {
          ...valuesRef.current.settings,
          challenges: [defaultChallenge],
        },
      });

      hasSetDefaultChallenge.current = true;
    }
  }, [isInCreateSubplebbitView, challengeOptions, challengesSettings, challengeNames]);

  const toggleSettings = (index: number) => {
    const newShowSettings = [...showSettings];
    newShowSettings[index] = !newShowSettings[index];
    setShowSettings(newShowSettings);
  };

  const handleAddChallenge = () => {
    const defaultOptions = challengeOptions['captcha-canvas-v3'] || {};
    const newChallenge = {
      name: 'captcha-canvas-v3',
      defaultOptions,
    };
    const updatedChallenges = [...(settings?.challenges || []), newChallenge];
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowSettings((oldShowSettings) => [...oldShowSettings, true]);
  };

  const handleDeleteChallenge = (index: number) => {
    const updatedChallenges = settings?.challenges?.filter((_: any, idx: number) => idx !== index);
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowSettings((oldShowSettings) => oldShowSettings.filter((_, idx) => idx !== index));
  };

  const handleChallengeTypeChange = (index: number, newType: string) => {
    const options = challengeOptions[newType] || {};
    const currentChallenges = challenges || [];
    const updatedChallenges = [...currentChallenges];
    updatedChallenges[index] = { ...updatedChallenges[index], name: newType, options };

    setSubplebbitSettingsStore({
      settings: {
        ...settings,
        challenges: updatedChallenges,
      },
    });
  };

  return (
    <div className={`${styles.box} ${isReadOnly && !challenges ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('anti_spam_challenges')}</div>
      <div className={styles.boxSubtitle}>{t('anti_spam_challenges_subtitle')}</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={handleAddChallenge} disabled={isReadOnly}>
            {t('add_a_challenge')}
          </button>
        )}
        {challenges.length === 0 && !isInCreateSubplebbitView && <span className={styles.noChallengeWarning}>{t('warning_spam')}</span>}
        {challenges?.map((challenge: any, index: number) => (
          <div key={index} className={styles.challenge}>
            Challenge #{index + 1}
            {!isReadOnly && <span className={styles.deleteButton} title='delete challenge' onClick={() => (isReadOnly ? {} : handleDeleteChallenge(index))} />}
            <br />
            {isReadOnly ? (
              <span className={styles.readOnlyChallenge}>{challenge?.name}</span>
            ) : (
              <select value={challenge?.name} onChange={(e) => handleChallengeTypeChange(index, e.target.value)} disabled={isReadOnly}>
                {challengeNames?.map((challenge) => (
                  <option key={challenge} value={challenge}>
                    {challenge}
                  </option>
                ))}
              </select>
            )}
            {!isReadOnly && (
              <button className={styles.challengeEditButton} onClick={() => toggleSettings(index)} disabled={isReadOnly}>
                {showSettings[index] ? t('hide_settings') : t('show_settings')}
              </button>
            )}
            <ChallengeSettings
              challenge={challenge}
              challengesSettings={challengesSettings || {}}
              index={index}
              isReadOnly={isReadOnly}
              setSubplebbitSettingsStore={setSubplebbitSettingsStore}
              settings={settings}
              showSettings={showSettings[index]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenges;
