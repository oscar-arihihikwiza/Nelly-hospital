<?php
// forgot-password.php
require_once 'auth.php';

$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo = get_pdo();
        $email = trim($_POST['email'] ?? '');
        $username = trim($_POST['username'] ?? '');
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        
        if (!$email || !$username || !$newPassword || !$confirmPassword) {
            $error = 'Please fill in all required fields';
            throw new Exception($error);
        }
        
        if ($newPassword !== $confirmPassword) {
            $error = 'Passwords do not match';
            throw new Exception($error);
        }
        
        // Find user
        $stmt = $pdo->prepare('SELECT u.id, u.name, u.username, u.role, p.email 
                                  FROM users u 
                                  JOIN patients p ON u.name = p.fn || \' \' || p.ln 
                                  WHERE u.username = ? AND p.email = ?');
        $stmt->execute([$username, $email]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Update password
            $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
            $updateStmt->execute([$hashed, $user['id']]);
            
            $success = true;
        } else {
            $error = 'No matching account found with that username and email';
            throw new Exception($error);
        }
        
    } catch (Exception $e) {
        if (!$error) {
            $error = $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Forgot Password - HAK Medical</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="index.css">
</head>
<body>
<div id="toast"></div>

<div id="sl">
  <div class="lbx">✚</div><div class="lbx">✚</div><div class="lbx">✚</div>
  <div class="lcard" style="max-width: 500px;">
    <div class="llogo">
      <div class="lcross"><svg viewBox="0 0 36 36" fill="none"><rect x="14.5" y="4" width="7" height="28" rx="3.5" fill="white"/><rect x="4" y="14.5" width="28" height="7" rx="3.5" fill="white"/></svg></div>
      <div class="ltitle">Reset Password</div>
      <div class="lsub">HAK Medical & Physiotherapy Center</div>
    </div>
    <div class="ldiv"></div>
    
    <?php if ($success): ?>
        <div class="alert alert-success text-center">
            <h4 class="mb-2">Password Reset Successful!</h4>
            <p class="mb-3">You can now <a href="login.php" class="alert-link" style="font-weight: 600;">login here</a> with your new password.</p>
        </div>
    <?php else: ?>
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <form method="POST" action="forgot-password.php">
            <div class="mb-3">
                <label class="form-label" for="username">Username</label>
                <input type="text" class="form-control" id="username" name="username" required>
            </div>
            <div class="mb-3">
                <label class="form-label" for="email">Registered Email</label>
                <input type="email" class="form-control" id="email" name="email" required>
            </div>
            <div class="mb-3">
                <label class="form-label" for="new_password">New Password</label>
                <input type="password" class="form-control" id="new_password" name="new_password" required>
            </div>
            <div class="mb-3">
                <label class="form-label" for="confirm_password">Confirm New Password</label>
                <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
            </div>
            <button type="submit" class="lbtn w-100">Reset Password</button>
        </form>
        
        <div class="text-center mt-3">
            Remember your password? <a href="login.php" style="color: #2089ab; text-decoration: none; font-weight: 500;">Login here</a>
        </div>
    <?php endif; ?>
    
    <div class="lcontact mt-4">30m off Gayaza Road to Magere &nbsp;|&nbsp; 0705 062 567 / 0773 029 999<br>hakmedicalcenter@gmail.com</div>
  </div>
  <div class="lfooter">Excellence in Care, Honesty in Action</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>