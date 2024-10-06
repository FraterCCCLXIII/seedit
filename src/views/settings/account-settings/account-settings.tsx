import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createAccount, deleteAccount, exportAccount, importAccount, setAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import stringify from 'json-stringify-pretty-compact';
import { useTranslation } from 'react-i18next';
import styles from './account-settings.module.css';

const AccountSettings = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const { accounts } = useAccounts();
  const [text, setText] = useState('');
  const switchToNewAccountRef = useRef(false);

  const accountJson = useMemo(
    () => stringify({ account: { ...account, plebbit: undefined, karma: undefined, plebbitReactOptions: undefined, unreadNotificationCount: undefined } }),
    [account],
  );

  const accountsOptions = accounts.map((account) => (
    <option key={account?.id} value={account?.name}>
      u/{account?.author?.shortAddress}
    </option>
  ));

  useEffect(() => {
    setText(accountJson);
  }, [accountJson]);

  const switchToLastAccount = useCallback(async () => {
    if (switchToNewAccountRef.current && accounts.length > 0) {
      const lastAccount = accounts[accounts.length - 1];
      await setActiveAccount(lastAccount.name);
      switchToNewAccountRef.current = false;
    }
  }, [accounts]);

  useEffect(() => {
    switchToLastAccount();
  }, [switchToLastAccount]);

  const _createAccount = async () => {
    try {
      await createAccount();
      switchToNewAccountRef.current = true;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  const _deleteAccount = (accountName: string) => {
    if (!accountName) {
      return;
    } else if (window.confirm(t('delete_confirm', { value: accountName, interpolation: { escapeValue: false } }))) {
      if (window.confirm(t('double_confirm'))) {
        deleteAccount(accountName);
      }
    } else {
      return;
    }
  };

  const saveAccount = async () => {
    try {
      const newAccount = JSON.parse(text).account;
      // force keeping the same id, makes it easier to copy paste
      await setAccount({ ...newAccount, id: account?.id });
      alert(`Saved ${newAccount.name}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  const _importAccount = async () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    // Handle file selection
    fileInput.onchange = async (event) => {
      try {
        const files = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
          throw new Error('No file selected.');
        }
        const file = files[0];

        // Read the file content
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const fileContent = e.target!.result;
            if (typeof fileContent !== 'string') {
              throw new Error('File content is not a string.');
            }
            const newAccount = JSON.parse(fileContent);
            await importAccount(fileContent);

            // Store the imported account's address to prevent showing the info bar in the profile page on first access
            if (newAccount.account?.author?.address) {
              localStorage.setItem('importedAccountAddress', newAccount.account.author.address);
            }

            switchToNewAccountRef.current = true;
            alert(`Imported ${newAccount.account?.name}`);
            window.location.reload();
          } catch (error) {
            if (error instanceof Error) {
              alert(error.message);
              console.log(error);
            } else {
              console.error('An unknown error occurred:', error);
            }
          }
        };
        reader.readAsText(file);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
          console.log(error);
        } else {
          console.error('An unknown error occurred:', error);
        }
      }
    };

    // Trigger file selection dialog
    fileInput.click();
  };

  const _exportAccount = async () => {
    try {
      const accountString = await exportAccount();
      const accountObject = JSON.parse(accountString);
      const formattedAccountJson = JSON.stringify(accountObject, null, 2);

      // Create a Blob from the JSON string
      const blob = new Blob([formattedAccountJson], { type: 'application/json' });

      // Create a URL for the Blob
      const fileUrl = URL.createObjectURL(blob);

      // Create a temporary download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${account.name}.json`;

      // Append the link, trigger the download, then remove the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the Blob URL
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  return (
    <span className={styles.categorySettings}>
      <div className={styles.accountAddress}>
        <select value={account?.name} onChange={(e) => setActiveAccount(e.target.value)}>
          {accountsOptions}
        </select>{' '}
        {t('is_current_account')}
      </div>
      <div className={styles.createAccount}>
        <button onClick={_createAccount}>{t('create')}</button> {t('a_new_account')}
      </div>
      <span className={styles.settingTitle}>{t('account_data_preview')}</span>
      <div className={styles.accountData}>
        <textarea className={styles.textarea} value={text} onChange={(e) => setText(e.target.value)} autoCorrect='off' autoComplete='off' spellCheck='false' />
        <div className={styles.accountButtons}>
          <div>
            <button onClick={saveAccount}>{t('save')}</button> {t('or')} <button onClick={() => setText(accountJson)}>{t('reset')}</button> {t('changes')}
          </div>
          <div>
            <button onClick={_importAccount}>{t('import')}</button> {t('full_account_data')}
          </div>
          <div>
            <button onClick={_exportAccount}>{t('export')}</button> {t('full_account_data')}
          </div>
          <div className={styles.deleteAccountBox}>
            <button onClick={() => _deleteAccount(account?.name)}>{t('delete')}</button> {t('this_account')}
          </div>
        </div>
      </div>
    </span>
  );
};

export default AccountSettings;
