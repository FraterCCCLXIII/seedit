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
          <a href='#/submit'>
            <div className='_largeButton_121oq_104'>
              Submit a new post
              <div className='_nub_121oq_122'></div>
            </div>
          </a>

          <div className='_largeButton_121oq_104'>
            Create your own community
            <div className='_nub_121oq_122'></div>
          </div>

          <div className='_communitySubtitles_121oq_393'>
            <span className='_createCommunityImage_121oq_401'>
              <img alt='' src='assets/sprout/sprout-2.png' />
            </span>
            <div className='_createCommunitySubtitle_121oq_416'>...for Reddit's downfall.</div>
            <div className='_createCommunitySubtitle_121oq_416'>...unstoppable by design.</div>
          </div>

          <div className='_footer_121oq_300'>
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
        </div>
      </div>

      {/* Additional Content */}
      {children}
    </div>
  );
}

export default RightColumn;
