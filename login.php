<?php
// login.php
// Login screen for HAK Medical Center staff

require_once 'auth.php';

// If session is already active, redirect to router
if (isset($_SESSION['user'])) {
    header('Location: index.php');
    exit;
}

$error = false;
$username = '';
$role = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['lu'] ?? '';
    $password = $_POST['lp'] ?? '';
    $role = $_POST['lr'] ?? '';
    
    if (login_user($username, $password, $role)) {
        header('Location: index.php');
        exit;
    } else {
        $error = true;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login - HAK Medical &amp; Physiotherapy Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="index.css">
</head>
<body>
<div id="toast"></div>

<!-- LOGIN -->
<div id="sl">
  <div class="lbx">✚</div><div class="lbx">✚</div><div class="lbx">✚</div>
  <div class="lcard">
    <div class="llogo">
      <div class="lcross"><svg viewBox="0 0 36 36" fill="none"><rect x="14.5" y="4" width="7" height="28" rx="3.5" fill="white"/><rect x="4" y="14.5" width="28" height="7" rx="3.5" fill="white"/></svg></div>
      <div class="ltitle">HAK Medical &amp; Physiotherapy</div>
      <div class="lsub">Point of Care System</div>
    </div>
    <div class="ldiv"></div>
    
    <form method="POST" action="login.php">
      <div class="lf"><label for="lr">Role</label>
        <select id="lr" name="lr" required>
          <option value="">— Select your role —</option>
          <option value="patient" <?php echo $role === 'patient' ? 'selected' : ''; ?>>Patient</option>
          <option value="admin" <?php echo $role === 'admin' ? 'selected' : ''; ?>>Administrator</option>
          <option value="doctor" <?php echo $role === 'doctor' ? 'selected' : ''; ?>>Doctor / Clinician</option>
          <option value="nurse" <?php echo $role === 'nurse' ? 'selected' : ''; ?>>Nurse / Clinical Officer</option>
          <option value="lab" <?php echo $role === 'lab' ? 'selected' : ''; ?>>Laboratory / Ultrasound</option>
          <option value="reception" <?php echo $role === 'reception' ? 'selected' : ''; ?>>Reception / Registration</option>
          <option value="pharmacy" <?php echo $role === 'pharmacy' ? 'selected' : ''; ?>>Pharmacy</option>
          <option value="billing" <?php echo $role === 'billing' ? 'selected' : ''; ?>>Billing</option>
        </select>
      </div>
      <div class="lf"><label for="lu">Username</label>
        <input type="text" id="lu" name="lu" placeholder="e.g. dr.karim" autocomplete="username" value="<?php echo htmlspecialchars($username); ?>" required>
      </div>
      <div class="lf"><label for="lp">Password</label>
        <input type="password" id="lp" name="lp" placeholder="••••••••" autocomplete="current-password" required>
      </div>
      <button type="submit" class="lbtn">Sign In to System</button>
    </form>
    
    <div class="lerr" id="lerr" style="<?php echo $error ? 'display: block;' : ''; ?>">Incorrect credentials or role selection. Please try again.</div>
    <div style="display: flex; gap: 20px; justify-content: center; margin-top: 15px; font-size: 14px;">
      <a href="register.php" style="color: #2089ab; text-decoration: none; font-weight: 500;">Register as a new patient</a>
      <span style="color: var(--tx3);">•</span>
      <a href="forgot-password.php" style="color: #2089ab; text-decoration: none; font-weight: 500;">Forgot your password?</a>
    </div>
    <div class="lcontact">30m off Gayaza Road to Magere &nbsp;|&nbsp; 0705 062 567 / 0773 029 999<br>hakmedicalcenter@gmail.com</div>
  </div>
  <div class="lfooter">Excellence in Care, Honesty in Action</div>
</div>

<script>
// Auto-hide the error alert when user attempts correction
document.querySelectorAll('input, select').forEach(element => {
  element.addEventListener('input', () => {
    const err = document.getElementById('lerr');
    if (err) err.style.display = 'none';
  });
});
</script>
</body>
</html>
