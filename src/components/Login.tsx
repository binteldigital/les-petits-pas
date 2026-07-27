import React, { useState, useRef } from 'react';
import type { User } from '../types';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onSignup: (newUser: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLoginSuccess, onSignup }) => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'parent' | 'admin'>('parent');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [childName, setChildName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [avatarFileUrl, setAvatarFileUrl] = useState<string>('');

  const handleSignupAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const val = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = val.substring(0, 1);
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-focus next input
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleRoleChange = (role: 'parent' | 'admin') => {
    setSelectedRole(role);
    setIsSignupMode(false);
    setErrorMessage(null);
    setOtp(Array(6).fill(''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    const enteredOtp = otp.join('');

    setTimeout(() => {
      if (selectedRole === 'admin') {
        // Strict Admin Credentials check
        if (email.toLowerCase() !== 'admin@petitlien.fr' || password !== 'admin' || enteredOtp !== '123456') {
          setIsVerifying(false);
          setErrorMessage("Identifiants ou code d'accès Administration incorrects. Veuillez réessayer.");
          return;
        }

        setIsVerifying(false);
        setIsSuccess(true);
        setTimeout(() => {
          const adminUser = users.find(u => u.role === 'admin' && u.email === 'admin@petitlien.fr') || {
            id: 'user-admin',
            name: 'Direction Crèche',
            email: 'admin@petitlien.fr',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWqqKTJzU_6SGZZlh4uDmtKctGql2FiP4Pqx7fQrFcKBUeiDQxM-mvIo6dvp2kZC1VOQ9Hv_4ZCkPKCCCWNueVqYUmHw-lCFXkuiagIFMqv5pRibbrRP2sRu9iamS5Vr0CAVf3yfHfhG0YVKLRC8vgf8YqNYNXDnaa0LAy8oH2YHnhBktjx4qo9tN7Uh6p6TWeWV9mSGMHrvYoeb0GBnPhep6pqEagY4dmfS6QLw1o-ccncNVB8BBOOAcYjtY5By2JzGhYC3QO-1zJ',
            role: 'admin',
            following: []
          };
          onLoginSuccess(adminUser);
        }, 800);

      } else {
        // Parent accounts validation
        if (isSignupMode) {
          // Check invitation code
          if (enteredOtp !== '123456') {
            setIsVerifying(false);
            setErrorMessage("Code d'invitation Crèche invalide. Saisissez le code d'inscription obligatoire fourni par l'établissement.");
            return;
          }

          // Check duplicate email
          const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
          if (emailExists) {
            setIsVerifying(false);
            setErrorMessage("Cette adresse email est déjà enregistrée. Veuillez vous connecter dans l'espace Parent.");
            return;
          }

          setIsVerifying(false);
          setIsSuccess(true);
          setTimeout(() => {
            const newRegisteredUser: User = {
              id: `user-${Date.now()}`,
              name: fullName || 'Nouvel Utilisateur',
              email: email,
              avatar: avatarFileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
              role: 'parent',
              following: [],
              childName: childName || 'Mon Enfant',
              username: (fullName || 'parent').toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100)
            };
            onSignup(newRegisteredUser);
            onLoginSuccess(newRegisteredUser);
          }, 800);

        } else {
          // Parent Login lookup
          const foundUser = users.find(
            u => u.role === 'parent' && u.email.toLowerCase() === email.toLowerCase()
          );

          if (!foundUser) {
            setIsVerifying(false);
            setErrorMessage("Compte parent introuvable. Veuillez vérifier vos identifiants ou créer un compte.");
            return;
          }

          setIsVerifying(false);
          setIsSuccess(true);
          setTimeout(() => {
            onLoginSuccess(foundUser);
          }, 800);
        }
      }
    }, 1500);
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setOtp(Array(6).fill(''));
    setFullName('');
    setChildName('');
    setAvatarFileUrl('');
    setErrorMessage(null);
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-container-margin relative overflow-hidden bg-background font-quicksand">
      {/* Decorative Floating Shapes */}
      <div className="floating-shape w-64 h-64 bg-primary-container rounded-full top-[-5%] left-[-10%]"></div>
      <div className="floating-shape w-80 h-80 bg-tertiary-container rounded-full bottom-[-10%] right-[-5%] [animation-delay:-5s]"></div>
      <div className="floating-shape w-48 h-48 bg-secondary-container rounded-full top-[20%] right-[10%] [animation-delay:-12s]"></div>
 
      {/* Main Container */}
      <main className="w-full max-w-md bg-white/80 backdrop-blur-md p-section-padding rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center z-10">
        
        {/* Logo Section */}
        <header className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-primary-container/20 rounded-full">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              child_care
            </span>
          </div>
          <h1 className="text-28px font-bold text-primary tracking-tight">Petit Lien</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">Le lien précieux entre parents et éducateurs</p>
        </header>

        {/* Error notification bar */}
        {errorMessage && (
          <div className="w-full p-4 mb-5 bg-red-55 text-red-700 border border-red-200 rounded-lg text-[13px] font-semibold flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Role Toggle Selector */}
        <div className="w-full bg-surface-container-low p-1 rounded-full flex mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('parent')}
            className={`flex-1 py-2.5 rounded-full text-[14px] font-bold transition-all ${
              selectedRole === 'parent' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Espace Parents
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 py-2.5 rounded-full text-[14px] font-bold transition-all ${
              selectedRole === 'admin' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Espace Crèche
          </button>
        </div>

        {/* Form Section */}
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          
          {/* Credentials */}
          <div className="space-y-4">
            {isSignupMode && (
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-1 ml-2" htmlFor="fullName">
                  Nom et Prénom
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    person
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setErrorMessage(null); }}
                    className="w-full h-14 pl-12 pr-4 bg-surface-container-low border-none rounded-lg text-[15px] focus:ring-2 focus:ring-primary-container focus:outline-none transition-all"
                    placeholder="Sophie Dubois"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-bold text-on-surface-variant mb-1 ml-2" htmlFor="email">
                Adresse Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
                  className="w-full h-14 pl-12 pr-4 bg-surface-container-low border-none rounded-lg text-[15px] focus:ring-2 focus:ring-primary-container focus:outline-none transition-all"
                  placeholder={selectedRole === 'admin' ? "admin@petitlien.fr" : "nom@exemple.com"}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-on-surface-variant mb-1 ml-2" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                  className="w-full h-14 pl-12 pr-12 bg-surface-container-low border-none rounded-lg text-[15px] focus:ring-2 focus:ring-primary-container focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {isSignupMode && selectedRole === 'parent' && (
              <>
                <div>
                  <label className="block text-[12px] font-bold text-on-surface-variant mb-1 ml-2" htmlFor="childName">
                    Nom et prénom de l'enfant
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                      child_friendly
                    </span>
                    <input
                      id="childName"
                      type="text"
                      value={childName}
                      onChange={(e) => { setChildName(e.target.value); setErrorMessage(null); }}
                      className="w-full h-14 pl-12 pr-4 bg-surface-container-low border-none rounded-lg text-[15px] focus:ring-2 focus:ring-primary-container focus:outline-none transition-all"
                      placeholder="Léo Dubois"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-on-surface-variant mb-2 ml-2">
                    Photo de profil (Optionnel)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full border border-outline-variant overflow-hidden bg-surface-container-low flex items-center justify-center flex-shrink-0">
                      {avatarFileUrl ? (
                        <img className="w-full h-full object-cover" src={avatarFileUrl} alt="profile preview" />
                      ) : (
                        <span className="material-symbols-outlined text-outline text-[24px]">person</span>
                      )}
                    </div>
                    <label className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-low border border-outline-variant/60 rounded-lg cursor-pointer hover:bg-surface-container-high active:scale-95 transition-all text-[12.5px] font-bold text-on-surface">
                      <span className="material-symbols-outlined text-[16px]">image</span>
                      Choisir une photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignupAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Invitation Code Section (Access Control) */}
          <div className="bg-surface-container-highest/40 p-5 rounded-lg border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-tertiary text-xl">key</span>
              <label className="text-[16px] font-bold text-tertiary">
                {selectedRole === 'admin' ? "Code d'accès Administration" : "Code d'invitation Crèche"}
              </label>
            </div>
            <p className="text-[13px] text-on-surface-variant mb-4 font-semibold leading-snug">
              {selectedRole === 'admin' 
                ? "Saisissez le code d'accès administrateur à 6 chiffres." 
                : "Ce code obligatoire vous a été fourni par la direction."}
            </p>
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full justify-items-center">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  className="w-full aspect-[4/5] sm:aspect-square text-center bg-white border border-outline-variant rounded-lg text-[18px] sm:text-[20px] font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 flex items-center justify-center p-0"
                  required
                />
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isVerifying}
              className={`w-full h-[56px] rounded-full font-bold text-[17px] shadow-[0_10px_20px_rgba(48,98,138,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 text-white ${
                isSuccess
                  ? 'bg-tertiary'
                  : 'bg-primary hover:bg-on-primary-fixed-variant'
              }`}
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  <span>Vérification...</span>
                </>
              ) : isSuccess ? (
                <span>Bienvenue !</span>
              ) : (
                <>
                  <span>{isSignupMode ? "Créer un compte" : "Se connecter"}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="flex flex-col items-center gap-3 text-center">
            {!isSignupMode && (
              <a href="#" className="text-[13px] text-primary hover:underline underline-offset-4 font-bold">
                Mot de passe oublié ?
              </a>
            )}
            <div className="w-full h-px bg-outline-variant/30 my-1"></div>
            {selectedRole === 'parent' && (
              <p className="text-[13px] text-on-surface-variant font-semibold">
                {isSignupMode ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}
                {' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary font-bold hover:underline bg-transparent border-none p-0 inline cursor-pointer ml-1"
                >
                  {isSignupMode ? "Se connecter" : "S'inscrire"}
                </button>
              </p>
            )}
          </div>
        </form>
      </main>

      {/* Footer Security Note */}
      <footer className="mt-6 flex flex-col items-center gap-1.5 text-on-surface-variant/60">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span className="text-[11px] font-bold uppercase tracking-widest">
            Sécurité Crèche Active - SSL/AES
          </span>
        </div>
        <div className="text-[10px] font-medium opacity-50">
          © 2026 Petit Lien SAS. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};
