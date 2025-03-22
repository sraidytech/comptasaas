'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  // General Settings
  const [systemName, setSystemName] = useState('SRACOM COMPTA MANAGEMENT');
  const [systemDescription, setSystemDescription] = useState('Système de gestion comptable multi-locataires');
  const [supportEmail, setSupportEmail] = useState('support@sracom.com');
  const [supportPhone, setSupportPhone] = useState('+212 5XX-XXXXXX');
  
  // Security Settings
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [passwordRequireUppercase, setPasswordRequireUppercase] = useState(true);
  const [passwordRequireNumbers, setPasswordRequireNumbers] = useState(true);
  const [passwordRequireSymbols, setPasswordRequireSymbols] = useState(true);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState('90');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [sessionTimeout, setSessionTimeout] = useState('60');
  
  // Email Settings
  const [smtpServer, setSmtpServer] = useState('smtp.sracom.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('notifications@sracom.com');
  const [smtpPassword, setSmtpPassword] = useState('********');
  const [emailFromName, setEmailFromName] = useState('SRACOM COMPTA');
  const [emailFromAddress, setEmailFromAddress] = useState('notifications@sracom.com');
  
  // Localization Settings
  const [defaultLanguage, setDefaultLanguage] = useState('fr');
  const [defaultTimezone, setDefaultTimezone] = useState('Africa/Casablanca');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('24h');
  
  const handleSaveGeneral = () => {
    console.log('Saving general settings:', {
      systemName,
      systemDescription,
      supportEmail,
      supportPhone,
    });
    // This would normally call an API to save the settings
  };
  
  const handleSaveSecurity = () => {
    console.log('Saving security settings:', {
      passwordMinLength,
      passwordRequireUppercase,
      passwordRequireNumbers,
      passwordRequireSymbols,
      passwordExpiryDays,
      maxLoginAttempts,
      sessionTimeout,
    });
    // This would normally call an API to save the settings
  };
  
  const handleSaveEmail = () => {
    console.log('Saving email settings:', {
      smtpServer,
      smtpPort,
      smtpUsername,
      smtpPassword,
      emailFromName,
      emailFromAddress,
    });
    // This would normally call an API to save the settings
  };
  
  const handleSaveLocalization = () => {
    console.log('Saving localization settings:', {
      defaultLanguage,
      defaultTimezone,
      dateFormat,
      timeFormat,
    });
    // This would normally call an API to save the settings
  };
  
  const handleTestEmail = () => {
    console.log('Testing email configuration');
    // This would normally call an API to test the email configuration
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Paramètres Système</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="localization">Localisation</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Généraux</CardTitle>
              <CardDescription>
                Configurez les paramètres généraux du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="systemName">Nom du Système</Label>
                <Input
                  id="systemName"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemDescription">Description</Label>
                <Textarea
                  id="systemDescription"
                  rows={3}
                  value={systemDescription}
                  onChange={(e) => setSystemDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Support</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Téléphone de Support</Label>
                  <Input
                    id="supportPhone"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>Enregistrer les Paramètres</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Sécurité</CardTitle>
              <CardDescription>
                Configurez les paramètres de sécurité du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Longueur Minimale du Mot de Passe</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={passwordMinLength}
                    onChange={(e) => setPasswordMinLength(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiryDays">Expiration du Mot de Passe (jours)</Label>
                  <Input
                    id="passwordExpiryDays"
                    type="number"
                    min="0"
                    max="365"
                    value={passwordExpiryDays}
                    onChange={(e) => setPasswordExpiryDays(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">0 = jamais</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Exigences du Mot de Passe</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="passwordRequireUppercase"
                    checked={passwordRequireUppercase}
                    onCheckedChange={(checked) => 
                      setPasswordRequireUppercase(checked === true)
                    }
                  />
                  <Label htmlFor="passwordRequireUppercase">
                    Exiger des lettres majuscules
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="passwordRequireNumbers"
                    checked={passwordRequireNumbers}
                    onCheckedChange={(checked) => 
                      setPasswordRequireNumbers(checked === true)
                    }
                  />
                  <Label htmlFor="passwordRequireNumbers">
                    Exiger des chiffres
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="passwordRequireSymbols"
                    checked={passwordRequireSymbols}
                    onCheckedChange={(checked) => 
                      setPasswordRequireSymbols(checked === true)
                    }
                  />
                  <Label htmlFor="passwordRequireSymbols">
                    Exiger des caractères spéciaux
                  </Label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Tentatives de Connexion Maximales</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={maxLoginAttempts}
                    onChange={(e) => setMaxLoginAttempts(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Délai d&apos;Expiration de Session (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSecurity}>Enregistrer les Paramètres</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Email</CardTitle>
              <CardDescription>
                Configurez les paramètres d&apos;envoi d&apos;emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">Serveur SMTP</Label>
                  <Input
                    id="smtpServer"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port SMTP</Label>
                  <Input
                    id="smtpPort"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">Nom d&apos;Utilisateur SMTP</Label>
                  <Input
                    id="smtpUsername"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Mot de Passe SMTP</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailFromName">Nom d&apos;Expéditeur</Label>
                  <Input
                    id="emailFromName"
                    value={emailFromName}
                    onChange={(e) => setEmailFromName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailFromAddress">Adresse d&apos;Expéditeur</Label>
                  <Input
                    id="emailFromAddress"
                    type="email"
                    value={emailFromAddress}
                    onChange={(e) => setEmailFromAddress(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleTestEmail}>
                Tester la Configuration
              </Button>
              <Button onClick={handleSaveEmail}>Enregistrer les Paramètres</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Localization Settings */}
        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Localisation</CardTitle>
              <CardDescription>
                Configurez les paramètres de langue et de format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Langue par Défaut</Label>
                  <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                    <SelectTrigger id="defaultLanguage">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية (Arabe)</SelectItem>
                      <SelectItem value="en">English (Anglais)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultTimezone">Fuseau Horaire par Défaut</Label>
                  <Select value={defaultTimezone} onValueChange={setDefaultTimezone}>
                    <SelectTrigger id="defaultTimezone">
                      <SelectValue placeholder="Sélectionner un fuseau horaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Casablanca">Casablanca (GMT+0/+1)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+1/+2)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Format de Date</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Sélectionner un format de date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Format d&apos;Heure</Label>
                  <Select value={timeFormat} onValueChange={setTimeFormat}>
                    <SelectTrigger id="timeFormat">
                      <SelectValue placeholder="Sélectionner un format d'heure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24h (14:30)</SelectItem>
                      <SelectItem value="12h">12h (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveLocalization}>Enregistrer les Paramètres</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
