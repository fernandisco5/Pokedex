import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, arrowBack, funnelSharp, funnelOutline, refresh, returnDownBackSharp } from 'ionicons/icons';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    // Registrar los iconos aquí
    addIcons({
      'heart': heart,
      'heart-outline': heartOutline,
      'arrow-back': arrowBack,
      'filter' : funnelSharp,
      'filter-outline' : funnelOutline,
      'reset' : refresh,
      'enter': returnDownBackSharp
    });
  }
}
