import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StrapiRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as StrapiRole[];  // Récupérer les rôles autorisés depuis la route
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;  // Si aucun rôle n'est requis, l'accès est autorisé
    }

    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;  // Si l'utilisateur n'est pas authentifié, redirige vers la page de connexion
    }

    // Comparer le rôle de l'utilisateur avec ceux autorisés par la route
    const hasRequiredRole = requiredRoles.includes(currentUser.role.name as StrapiRole);

    if (!hasRequiredRole) {
      this.router.navigate(['/unauthorized']);
      return false;  // Si l'utilisateur n'a pas le rôle requis, rediriger vers la page non autorisée
    }

    return true;
  }
}
