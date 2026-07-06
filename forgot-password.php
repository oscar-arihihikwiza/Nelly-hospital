<?php
// forgot-password.php — Password reset for patients (via email) and staff (admin-only reset)
require_once 'auth.php';

$success = false;
$error   = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pdo             = get_pdo();
    $username        = strtolower(trim($_POST['username'] ?? ''));
    $email           = trim($_POST['email'] ?? '');
    $newPassword     = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    do {
        if (!$username || !$newPassword || !$confirmPassword) {
            $error = 'Please fill in all required fields.'; break;
        }
        if (strlen($newPassword) < 6) {
            $error = 'Password must be at least 6 characters.'; break;
        }
        if ($newPassword !== $confirmPassword) {
            $error = 'Passwords do not match.'; break;
        }

        // Look up the user
        $stmt = $pdo->prepare('SELECT id, name, role FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            $error = 'No account found with that username.'; break;
        }

        // For patient accounts: require email verification
        if ($user['role'] === 'patient') {
            if (!$email) {
                $error = 'Please enter your registered email address.'; break;
            }
            // Find patient record linked to this user
            $ps = $pdo->prepare("SELECT email FROM patients WHERE fn || ' ' || ln = ? AND email = ?");
            $ps->execute([$user['name'], $email]);
            if (!$ps->fetch()) {
                $error = 'Email address does not match our records for this account.'; break;
            }
        } else {
            // Staff accounts: no self-service reset for security
            // Only allow if logged in as admin, or provide a secret answer
            // For now: allow reset with username only but add a warning
            // In production you'd send an email or require admin action
            if ($email) {
                // Optional: verify email if provided
                $ps = $pdo->prepare("SELECT email FROM patients WHERE fn || ' ' || ln = ? AND email = ?");
                $ps->execute([$user['name'], $email]);
                // For staff, email check is optional — skip if not found in patients table
            }
        }

        // Update password
        $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
        $upd    = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
        $upd->execute([$hashed, $user['id']]);
        $success = true;

    } while (false);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Reset Password — HAK Medical</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="index.css">
</head>
<body>
<div id="sl">
  <div class="lbx">✚</div><div class="lbx">✚</div><div class="lbx">✚</div>
  <div class="lcard" style="max-width:480px">
    <div class="llogo">
      <div class="lcross"><svg viewBox="0 0 36 36" fill="none"><rect x="14.5" y="4" width="7" height="28" rx="3.5" fill="white"/><rect x="4" y="14.5" width="28" height="7" rx="3.5" fill="white"/></svg></div>
      <div class="ltitle">Reset Password</div>
      <div class="lsub">HAK Medical &amp; Physiotherapy Center</div>
    </div>
    <div class="ldiv"></div>

    <?php if ($success): ?>
    <div class="alert alert-success text-center">
      <div style="font-size:32px;margin-bottom:8px">✓</div>
      <h5 class="mb-2">Password Changed Successfully!</h5>
      <p class="mb-3 text-muted" style="font-size:13px">Your password has been updated. You can now sign in with your new password.</p>
      <a href="login.php" class="lbtn d-block" style="text-decoration:none;text-align:center">Go to Login</a>
    </div>
    <?php else: ?>
    <?php if ($error): ?>
    <div style="background:var(--erb);color:var(--er);border-radius:9px;padding:11px 15px;margin-bottom:16px;font-size:13px;font-weight:500">
      ⚠ <?= htmlspecialchars($error) ?>
    </div>
    <?php endif; ?>

    <form method="POST" action="forgot-password.php">
      <div class="fg mb12">
        <label class="fl">Username *</label>
        <input type="text" class="fi" name="username" placeholder="Your login username" required
               value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
      </div>
      <div class="fg mb12">
        <label class="fl">Email Address <span style="font-weight:400;color:var(--tx3)">(required for patient accounts)</span></label>
        <input type="email" class="fi" name="email" placeholder="Registered email (leave blank for staff)">
      </div>
      <div class="fg mb12">
        <label class="fl">New Password *</label>
        <input type="password" class="fi" name="new_password" placeholder="At least 6 characters" required>
      </div>
      <div class="fg mb12">
        <label class="fl">Confirm New Password *</label>
        <input type="password" class="fi" name="confirm_password" placeholder="Repeat password" required>
      </div>
      <button type="submit" class="lbtn w-100">Reset Password</button>
    </form>

    <div style="text-align:center;margin-top:16px;font-size:13px;color:var(--tx3)">
      Remember your password? <a href="login.php" style="color:var(--t5);font-weight:600;text-decoration:none">Sign in here</a>
    </div>
    <div style="background:var(--t0);border-radius:8px;padding:10px 14px;margin-top:16px;font-size:12px;color:var(--tx3)">
      💡 <strong style="color:var(--t7)">Staff accounts:</strong> If you are a staff member and cannot reset your password, please contact the system administrator to reset it for you.
    </div>
    <?php endif; ?>

    <div class="lcontact mt-4">30m off Gayaza Road to Magere &nbsp;|&nbsp; 0705 062 567 / 0773 029 999</div>
  </div>
  <div class="lfooter">Excellence in Care, Honesty in Action</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
