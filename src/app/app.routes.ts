import { Routes } from '@angular/router';
import { IntroductionPageComponent } from './pages/introduction-page/introduction-page.component';
import { RegisterComponent } from './pages/register/register.component';
import { Scene1Component } from './pages/scene1/scene1.component';

export const routes: Routes = [

    {
        path:'',
        component : IntroductionPageComponent
    },{
        path : "register",
        component : RegisterComponent
    },
    {
        path: 'exorcism',
        component : Scene1Component
    }
];
