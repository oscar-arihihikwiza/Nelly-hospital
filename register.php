<?php
// register.php
// Patient self-registration page

require_once 'auth.php';

$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo = get_pdo();
        
        // Get form data
        $fn = trim($_POST['fn'] ?? '');
        $ln = trim($_POST['ln'] ?? '');
        $age = intval($_POST['age'] ?? 0);
        $sex = $_POST['sex'] ?? '';
        $ph = trim($_POST['ph'] ?? '');
        $ad = trim($_POST['ad'] ?? '');
        $bl = $_POST['bl'] ?? '';
        $ins = trim($_POST['ins'] ?? '');
        $al = trim($_POST['al'] ?? '');
        $pmh = trim($_POST['pmh'] ?? '');
        $em = trim($_POST['em'] ?? '');
        $oc = trim($_POST['oc'] ?? '');
        $nin = trim($_POST['nin'] ?? '');
        $email = trim($_POST['email'] ?? '');
        
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        
        if (!$fn || !$ln || !$ph || !$username || !$password || !$email) {
            $error = 'Please fill in all required fields';
            throw new Exception($error);
        }
        
        if ($password !== $confirmPassword) {
            $error = 'Passwords do not match';
            throw new Exception($error);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Please enter a valid email address';
            throw new Exception($error);
        }
        
        // Check if username exists
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            $error = 'Username already exists';
            throw new Exception($error);
        }
        
        // Generate OPD number
        $stmt = $pdo->query('SELECT COUNT(*) as cnt FROM patients');
        $row = $stmt->fetch();
        $opd = 'HAK-' . str_pad($row['cnt'] + 1, 3, '0', STR_PAD_LEFT);
        
        // Create patient record
        $stmt = $pdo->prepare('INSERT INTO patients (opd, fn, ln, age, sex, ph, ad, bl, ins, al, pmh, em, oc, created, nin, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$opd, $fn, $ln, $age, $sex, $ph, $ad, $bl, $ins, $al, $pmh, $em, $oc, date('Y-m-d'), $nin, $email]);
        $patientId = $pdo->lastInsertId();
        
        // Create user account
        $hashedPass = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO users (username, password, role, name, created_at) VALUES (?, ?, ?, ?, datetime("now"))');
        $stmt->execute([$username, $hashedPass, 'patient', "$fn $ln"]);
        
        $success = true;
        
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
<title>Register - HAK Medical & Physiotherapy Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="index.css">
</head>
<body>
<div id="toast"></div>

<!-- REGISTER -->
<div id="sl">
  <div class="lbx">✚</div><div class="lbx">✚</div><div class="lbx">✚</div>
  <div class="lcard" style="max-width: 850px; padding: 30px;">
    <div class="llogo">
      <div class="lcross"><svg viewBox="0 0 36 36" fill="none"><rect x="14.5" y="4" width="7" height="28" rx="3.5" fill="white"/><rect x="4" y="14.5" width="28" height="7" rx="3.5" fill="white"/></svg></div>
      <div class="ltitle">Patient Registration</div>
      <div class="lsub">HAK Medical & Physiotherapy Center</div>
    </div>
    <div class="ldiv"></div>
    
    <?php if ($success): ?>
        <div class="alert alert-success text-center">
            <h4 class="mb-2">Registration Successful!</h4>
            <p class="mb-2">Your OPD Number is: <strong><?php echo htmlspecialchars($opd); ?></strong></p>
            <p class="mb-3">You can now <a href="login.php" class="alert-link" style="font-weight: 600;">login here</a> using your username and password.</p>
        </div>
    <?php else: ?>
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <form method="POST" action="register.php" class="row g-3">
            <h5 class="col-12 mt-2 mb-1 text-muted text-uppercase" style="font-size: 12px; letter-spacing: 0.06em;">Personal Information</h5>
            <div class="col-md-4">
                <label class="form-label" for="fn">First Name *</label>
                <input type="text" class="form-control" id="fn" name="fn" required>
            </div>
            <div class="col-md-4">
                <label class="form-label" for="ln">Last Name *</label>
                <input type="text" class="form-control" id="ln" name="ln" required>
            </div>
            <div class="col-md-2">
                <label class="form-label" for="age">Age</label>
                <input type="number" class="form-control" id="age" name="age">
            </div>
            <div class="col-md-2">
                <label class="form-label" for="sex">Sex</label>
                <select class="form-select" id="sex" name="sex">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
            
            <div class="col-md-3">
                <label class="form-label" for="ph">Phone Number *</label>
                <input type="tel" class="form-control" id="ph" name="ph" required>
            </div>
            <div class="col-md-5">
                <label class="form-label" for="email">Email Address *</label>
                <input type="email" class="form-control" id="email" name="email" required placeholder="for appointment notifications">
            </div>
            <div class="col-md-4">
                <label class="form-label" for="nin">NIN (National Identification Number)</label>
                <input type="text" class="form-control" id="nin" name="nin">
            </div>
            
            <div class="col-md-6">
                <label class="form-label" for="ad">Address</label>
                <input type="text" class="form-control" id="ad" name="ad">
            </div>
            <div class="col-md-2">
                <label class="form-label" for="bl">Blood Type</label>
                <select class="form-select" id="bl" name="bl">
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label" for="ins">Insurance</label>
                <input type="text" class="form-control" id="ins" name="ins" placeholder="e.g. NHIF, AAR, etc.">
            </div>
            
            <div class="col-md-6">
                <label class="form-label" for="em">Emergency Contact</label>
                <input type="text" class="form-control" id="em" name="em" placeholder="Name and phone">
            </div>
            <div class="col-md-6">
                <label class="form-label" for="oc">Occupation</label>
                <input type="text" class="form-control" id="oc" name="oc">
            </div>
            
            <div class="col-md-6">
                <label class="form-label" for="al">Known Allergies</label>
                <input type="text" class="form-control" id="al" name="al" placeholder="e.g. Penicillin">
            </div>
            <div class="col-md-6">
                <label class="form-label" for="pmh">Past Medical History</label>
                <input type="text" class="form-control" id="pmh" name="pmh">
            </div>
            
            <h5 class="col-12 mt-3 mb-1 text-muted text-uppercase" style="font-size: 12px; letter-spacing: 0.06em;">Account Information</h5>
            <div class="col-md-4">
                <label class="form-label" for="username">Username *</label>
                <input type="text" class="form-control" id="username" name="username" required>
            </div>
            <div class="col-md-4">
                <label class="form-label" for="password">Password *</label>
                <input type="password" class="form-control" id="password" name="password" required>
            </div>
            <div class="col-md-4">
                <label class="form-label" for="confirm_password">Confirm Password *</label>
                <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
            </div>
            
            <div class="col-12 mt-3">
                <button type="submit" class="lbtn w-100">Create Account</button>
            </div>
        </form>
        
        <div class="text-center mt-3">
            Already have an account? <a href="login.php" style="color: #2089ab; text-decoration: none; font-weight: 500;">Login here</a>
        </div>
    <?php endif; ?>
    
    <div class="lcontact mt-4">30m off Gayaza Road to Magere &nbsp;|&nbsp; 0705 062 567 / 0773 029 999<br>hakmedicalcenter@gmail.com</div>
  </div>
  <div class="lfooter">Excellence in Care, Honesty in Action</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>