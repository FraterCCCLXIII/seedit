import React from 'react';

interface RightColumnProps {
  children: React.ReactNode;
}

function RightColumn({ children }: RightColumnProps) {
  return (
    <div className='sticky top-0 h-screen bg-background border-l border-border overflow-y-auto'>
      <div className='_sidebar_121oq_1'>
        <div className='_searchBarWrapper_121oq_21'>
          <div className='_searchBarWrapper_ubt34_98'>
            <form className='_searchBar_ubt34_1'>
              <input type='text' placeholder='Enter a community address' autoCorrect='off' autoComplete='off' spellCheck='false' autoCapitalize='off' />
              <input type='submit' value='' />
            </form>
            <div className='_infobar_ubt34_27 _slideUp_ubt34_82'>
              <label>
                <input type='checkbox' defaultChecked />
                Go to a community
              </label>
              <label>
                <input type='checkbox' />
                Search a post in this feed
              </label>
            </div>
          </div>
        </div>

        <div style={{ transform: 'translateY(0px)', transition: 'transform 0.3s linear', willChange: 'transform', marginTop: '-47px' }}>
          <a href='#/p/reddit-screenshots.eth/submit'>
            <div className='_largeButton_121oq_104'>
              Submit a new post
              <div className='_nub_121oq_122'></div>
            </div>
          </a>

          {/* Community Info */}
          <div className='_titleBox_121oq_25'>
            <a className='_title_121oq_25' href='#/p/reddit-screenshots.eth'>
              reddit-screenshots.eth
            </a>
            <div className='_subscribeContainer_121oq_47'>
              <span className='_subscribeButton_121oq_51'>
                <span className='_subscribeButton_xc2c4_1 _leaveButton_xc2c4_17'>leave</span>
              </span>
              <span>305 members</span>
            </div>
            <div className='_onlineLine_121oq_71'>
              <span className='_onlineIndicator_121oq_55 _online_121oq_55' title='Online'></span>
              <span>0 users here now</span>
            </div>
            <div>
              <div className='_description_121oq_75'>
                <span className='_markdown_9x11f_1'>
                  <p>Only screenshots from Reddit</p>
                </span>
              </div>
            </div>

            {/* Rules */}
            <div className='_rules_121oq_203'>
              <div className='_rulesTitle_121oq_211'>
                <strong>Rules</strong>
              </div>
              <span className='_markdown_9x11f_1'>
                <ol>
                  <li>SFW, no profanity in titles, no adult thumbnails</li>
                  <li>Only screenshots from Reddit</li>
                  <li>Content in English language only</li>
                </ol>
              </span>
            </div>

            <div className='_bottom_121oq_92'>
              created by <span>u/anonymous</span>
              <span className='_age_121oq_100'> a community for 2 years</span>
              <div className='_bottomButtons_121oq_284'>
                <span className='_blockSub_121oq_278'>block community</span>
              </div>
            </div>
          </div>

          <div className='_largeButton_121oq_104'>
            Create your own community
            <div className='_nub_121oq_122'></div>
          </div>

          <div className='_communitySubtitles_121oq_393'>
            <span className='_createCommunityImage_121oq_401'>
              <img alt='' src='assets/sprout/sprout-2.png' />
            </span>
            <div className='_createCommunitySubtitle_121oq_416'>...take ownership literally.</div>
            <div className='_createCommunitySubtitle_121oq_416'>...where you own the keys.</div>
          </div>

          {/* Moderators */}
          <div className='_list_121oq_158'>
            <div className='_listTitle_121oq_163'>moderators</div>
            <ul className='_listContent_121oq_172 _modsList_121oq_184'>
              <li>u/9sKUZiFRD8Jh</li>
              <li>u/NJQitv6ko3zZ</li>
              <li>u/estebanabaroa.eth</li>
              <li>u/plebeius.eth</li>
              <li>u/rinse12.eth</li>
            </ul>
          </div>

          <div className='_footer_121oq_300 _subplebbitFooterMargin_121oq_308'>
            <div className='_footerLinks_121oq_313'>
              <ul>
                <li>
                  <a href='https://github.com/plebbit/seedit/releases/tag/v0.5.9' target='_blank' rel='noopener noreferrer'>
                    v0.5.9
                  </a>
                </li>
                <span className='_footerSeparator_121oq_331'>|</span>
                <li>
                  <a href='https://github.com/plebbit/seedit' target='_blank' rel='noopener noreferrer'>
                    github
                  </a>
                  <span className='_footerSeparator_121oq_331'>|</span>
                </li>
                <li>
                  <a href='https://t.me/plebbit' target='_blank' rel='noopener noreferrer'>
                    telegram
                  </a>
                  <span className='_footerSeparator_121oq_331'>|</span>
                </li>
                <li>
                  <a href='https://x.com/getplebbit' target='_blank' rel='noopener noreferrer'>
                    x
                  </a>
                  <span className='_footerSeparator_121oq_331'>|</span>
                </li>
                <li>
                  <a href='https://plebbit.github.io/docs/learn/clients/seedit/what-is-seedit' target='_blank' rel='noopener noreferrer'>
                    docs
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='_readOnlySettingsLink_121oq_365'>
            <a href='#/p/reddit-screenshots.eth/settings'>Community Settings</a>
          </div>
        </div>
      </div>

      {/* Additional Content */}
      {children}
    </div>
  );
}

export default RightColumn;
