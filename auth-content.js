/**
 * Auth.FIFA.com Content Script
 * Shows overlay with START button - user clicks to trigger automation
 * Handles: Sign Up, Sign In, User Already Exists error
 */

(function() {
  console.log('[FIFA Auto Flow] Auth FIFA page detected:', window.location.href);

  let automationStarted = false;
  let signInHandled = false;
  let signUpFormHandled = false;
  let passwordHandled = false;
  let emailVerifyHandled = false;
  let userExistsHandled = false;
  let signInFormHandled = false;

  // Create overlay with START button
  function createOverlay() {
    // Check if overlay already exists
    if (document.getElementById('fifa-signup-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'fifa-signup-overlay';
    overlay.innerHTML = `
      <style>
        #fifa-signup-overlay {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 999999;
          font-family: Arial, sans-serif;
        }
        #fifa-signup-overlay .overlay-box {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #0f3460;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          min-width: 180px;
        }
        #fifa-signup-overlay .overlay-title {
          color: #e94560;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          text-align: center;
        }
        #fifa-signup-overlay .overlay-status {
          color: #00ff88;
          font-size: 11px;
          margin-bottom: 10px;
          text-align: center;
          min-height: 16px;
        }
        #fifa-signup-overlay .start-btn {
          width: 100%;
          padding: 12px 20px;
          background: linear-gradient(135deg, #e94560 0%, #c23a51 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        #fifa-signup-overlay .start-btn:hover {
          background: linear-gradient(135deg, #ff5a75 0%, #e94560 100%);
          transform: scale(1.02);
        }
        #fifa-signup-overlay .start-btn:disabled {
          background: #555;
          cursor: not-allowed;
          transform: none;
        }
        #fifa-signup-overlay .start-btn.running {
          background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
        }
      </style>
      <div class="overlay-box">
        <div class="overlay-title">FIFA SIGNUP AUTO</div>
        <div class="overlay-status" id="fifa-signup-status">Ready</div>
        <button class="start-btn" id="fifa-signup-start">▶ START</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Add click handler
    document.getElementById('fifa-signup-start').addEventListener('click', startAutomation);
  }

  function updateStatus(text) {
    const status = document.getElementById('fifa-signup-status');
    if (status) status.textContent = text;
  }

  function startAutomation() {
    if (automationStarted) return;
    automationStarted = true;

    const btn = document.getElementById('fifa-signup-start');
    if (btn) {
      btn.textContent = '⏳ RUNNING...';
      btn.classList.add('running');
      btn.disabled = true;
    }

    updateStatus('Automation started...');
    console.log('[FIFA Auto Flow] Automation started by user');

    // Run the page check
    checkPage();
  }

  // Simulate Alt+A keypress to trigger TM_Autofill
  function triggerAltA() {
    console.log('[FIFA Auto Flow] Triggering Alt+A...');
    updateStatus('Triggering autofill...');
    const event = new KeyboardEvent('keydown', {
      key: 'a',
      code: 'KeyA',
      altKey: true,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }

  function clickSignUp() {
    const links = document.querySelectorAll('a, button');
    for (const link of links) {
      const text = link.textContent.trim().toLowerCase();
      if (text === 'sign up' || text === 'signup' || text === 'create account') {
        console.log('[FIFA Auto Flow] Found Sign Up button, clicking...');
        updateStatus('Clicking Sign Up...');
        link.click();
        return true;
      }
    }
    return false;
  }

  function clickSignIn() {
    const links = document.querySelectorAll('a, button');
    for (const link of links) {
      const text = link.textContent.trim().toLowerCase();
      if (text === 'sign in' || text === 'signin' || text === 'log in' || text === 'login') {
        console.log('[FIFA Auto Flow] Found Sign In link, clicking...');
        updateStatus('Clicking Sign In...');
        link.click();
        return true;
      }
    }
    return false;
  }

  function clickContinue() {
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    for (const btn of buttons) {
      const text = (btn.textContent || btn.value || '').trim().toLowerCase();
      if (text === 'continue' || text === 'submit' || text === 'next' || text === 'create account') {
        console.log('[FIFA Auto Flow] Found Continue button, clicking...');
        updateStatus('Clicking Continue...');
        btn.click();
        return true;
      }
    }
    return false;
  }

  function clickSignInButton() {
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    for (const btn of buttons) {
      const text = (btn.textContent || btn.value || '').trim().toLowerCase();
      if (text === 'sign in' || text === 'signin' || text === 'log in' || text === 'login') {
        console.log('[FIFA Auto Flow] Found Sign In button, clicking...');
        updateStatus('Clicking Sign In...');
        btn.click();
        return true;
      }
    }
    return false;
  }

  // Check for "User already exists" error
  function hasUserExistsError() {
    const pageText = document.body.innerText.toLowerCase();
    return pageText.includes('user already exists') ||
           pageText.includes('user already exist') ||
           pageText.includes('account already exists') ||
           pageText.includes('email already exists') ||
           pageText.includes('email already registered');
  }

  function isSignInPage() {
    const hasSignInHeading = document.body.innerText.includes('Sign In');
    const hasSignUpLink = Array.from(document.querySelectorAll('a, button')).some(
      el => el.textContent.trim().toLowerCase() === 'sign up'
    );
    return hasSignInHeading && hasSignUpLink;
  }

  // Check if this is a Sign In FORM (not the landing page but actual form with email/password)
  function isSignInForm() {
    const pageText = document.body.innerText;
    const hasSignInHeading = pageText.includes('Sign In');
    const hasEmailField = document.querySelector('input[type="email"]') || document.querySelector('#email');
    const hasPasswordField = document.querySelector('input[type="password"]');
    const hasSignInButton = Array.from(document.querySelectorAll('button')).some(
      btn => btn.textContent.trim().toLowerCase() === 'sign in'
    );
    // It's a sign in form if it has email AND password fields (not just email like sign up)
    return hasSignInHeading && hasEmailField && hasPasswordField && hasSignInButton;
  }

  function isSignUpForm() {
    // Step 1: Main sign up form with email, name, country, DOB
    const pageText = document.body.innerText;
    const isStep1 = pageText.includes('Step 1 of 2') || pageText.includes('1 of 2');
    const hasEmail = document.querySelector('#email');
    const hasFirstname = document.querySelector('#firstname');
    const hasDateOfBirth = pageText.includes('Date of Birth');
    const hasCountry = pageText.includes('Country of Residence');
    // Make sure it's not showing "User already exists" error
    if (hasUserExistsError()) return false;
    return isStep1 || (hasEmail && hasFirstname) || hasDateOfBirth || hasCountry;
  }

  function isPasswordPage() {
    // Step 2: Password creation page
    const pageText = document.body.innerText;
    const isStep2 = pageText.includes('Step 2 of 2') || pageText.includes('2 of 2');
    const hasCreatePassword = pageText.includes('Create a password') || pageText.includes('Create your Password');
    const hasConfirmPassword = pageText.includes('Confirm Password');
    const noFirstname = !document.querySelector('#firstname');
    return isStep2 || (hasCreatePassword && hasConfirmPassword && noFirstname);
  }

  function isEmailVerifyPage() {
    // Email verification page with "Check your email" and "Enter Code"
    const pageText = document.body.innerText;
    const hasCheckEmail = pageText.includes('Check your email');
    const hasEnterCode = pageText.includes('Enter Code') || document.querySelector('input[placeholder*="Code"]');
    const hasVerifyButton = pageText.includes('Verify My Code') || pageText.includes('Verify');
    return hasCheckEmail || (hasEnterCode && hasVerifyButton);
  }

  // Handle "User already exists" error - click Sign In link
  function handleUserExistsError() {
    if (userExistsHandled) return;
    userExistsHandled = true;

    console.log('[FIFA Auto Flow] User already exists error detected - clicking Sign In...');
    updateStatus('User exists - signing in...');
    setTimeout(() => {
      clickSignIn();
    }, 1000);
  }

  // Handle Sign In FORM - fill with Alt+X and click Sign In
  function handleSignInForm() {
    if (signInFormHandled) return;
    signInFormHandled = true;

    console.log('[FIFA Auto Flow] Sign In form detected - triggering Alt+A...');
    updateStatus('Filling sign in form...');
    setTimeout(() => {
      triggerAltA();

      // After Alt+A fills email/password, click Sign In button
      setTimeout(() => {
        console.log('[FIFA Auto Flow] Clicking Sign In button after form fill...');
        clickSignInButton();
        updateStatus('Signed in!');
      }, 2500);
    }, 2000);
  }

  function handleSignInPage() {
    if (signInHandled) return;
    signInHandled = true;

    console.log('[FIFA Auto Flow] Sign In page - clicking Sign Up...');
    updateStatus('Going to Sign Up...');
    setTimeout(() => {
      clickSignUp();
    }, 1500);
  }

  function handleSignUpForm() {
    if (signUpFormHandled) return;
    signUpFormHandled = true;

    console.log('[FIFA Auto Flow] Sign Up form detected - triggering Alt+A in 2 seconds...');
    updateStatus('Filling sign up form...');

    // Wait for page to fully load, then trigger Alt+A
    setTimeout(() => {
      triggerAltA();

      // After Alt+A fills the form, wait and click Continue
      setTimeout(() => {
        console.log('[FIFA Auto Flow] Clicking Continue after form fill...');
        clickContinue();
        updateStatus('Form submitted!');
      }, 3000);
    }, 2000);
  }

  function handlePasswordPage() {
    if (passwordHandled) return;
    passwordHandled = true;

    console.log('[FIFA Auto Flow] Password page - triggering Alt+A...');
    updateStatus('Filling password...');
    setTimeout(() => {
      triggerAltA();

      // After Alt+A fills password, click Continue
      setTimeout(() => {
        clickContinue();
        updateStatus('Password set!');
      }, 2000);
    }, 1500);
  }

  function handleEmailVerifyPage() {
    if (emailVerifyHandled) return;
    emailVerifyHandled = true;

    console.log('[FIFA Auto Flow] Email verification page - waiting 10 seconds for OTP...');
    updateStatus('Waiting for OTP...');

    // Wait 10 seconds for OTP to arrive
    setTimeout(() => {
      // First, click the code input box to focus it
      console.log('[FIFA Auto Flow] Clicking code input box...');
      const codeInput = document.querySelector('input[placeholder*="Code"]') ||
                        document.querySelector('input[name*="code"]') ||
                        document.querySelector('input[type="text"]');
      if (codeInput) {
        codeInput.click();
        codeInput.focus();
        console.log('[FIFA Auto Flow] Code input focused');
      }

      // Wait a moment, then trigger Alt+A
      setTimeout(() => {
        console.log('[FIFA Auto Flow] Triggering Alt+A to fill OTP code...');
        updateStatus('Filling OTP...');
        triggerAltA();

        // After Alt+A fills the code, click Verify button
        setTimeout(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            const text = (btn.textContent || '').trim().toLowerCase();
            if (text.includes('verify')) {
              console.log('[FIFA Auto Flow] Clicking Verify button...');
              btn.click();
              updateStatus('Verified!');
              return;
            }
          }
        }, 2000);
      }, 500);
    }, 10000); // 10 second wait
  }

  function checkPage() {
    // Only run automation if started
    if (!automationStarted) return;

    // FIRST: Check for "User already exists" error - highest priority
    // This means sign up failed, so we need to sign in instead
    if (hasUserExistsError()) {
      handleUserExistsError();
      return;
    }

    // Sign Up form - trigger Alt+A (check this BEFORE sign in)
    if (isSignUpForm()) {
      handleSignUpForm();
      return;
    }

    // Password page - trigger Alt+A
    if (isPasswordPage()) {
      handlePasswordPage();
      return;
    }

    // Email verification page - wait 10s then Alt+A for OTP
    if (isEmailVerifyPage()) {
      handleEmailVerifyPage();
      return;
    }

    // Sign In page (landing or form) - always click Sign Up first
    // Only handle sign in form AFTER user already exists error redirects here
    if (isSignInPage() || isSignInForm()) {
      // If we already tried sign up and got redirected back to sign in
      // (indicated by userExistsHandled being true), then fill sign in form
      if (userExistsHandled && isSignInForm()) {
        handleSignInForm();
        return;
      }
      // Otherwise, click Sign Up to go to sign up page first
      handleSignInPage();
      return;
    }
  }

  // Create overlay when page loads
  setTimeout(createOverlay, 1000);

  // Observe for page changes (SPA navigation) - only run if automation started
  const observer = new MutationObserver(() => {
    // Re-create overlay if it was removed
    if (!document.getElementById('fifa-signup-overlay')) {
      createOverlay();
    }
    // Continue automation if already started
    if (automationStarted) {
      setTimeout(checkPage, 1500);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
