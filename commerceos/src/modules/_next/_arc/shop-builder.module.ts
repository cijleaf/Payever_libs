import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PebThemesModule } from '@pe/builder-themes';
import { PebShopModule } from '@pe/builder-shop';
import { PePlatformHeaderModule } from '@modules/platform-header/src';
import { PeShopThemesComponent } from './pages/themes/shop-themes.component';
import { PeShopBuilderRoutingModule } from './shop-builder-routing.module';
import { PeShopBuilderComponent } from './shop-builder.component';
import { PeShopEditorComponent } from './pages/editor/shop-editor.component';
import { PebEditorModule } from '@pe/builder-editor';
import { PeShopCreateComponent } from './pages/create/shop-create.component';
import { PeShopListComponent } from './pages/list/shop-list.component';
import { PeShopSettingsComponent } from './pages/settings/shop-settings.component';

@NgModule({
  imports: [
    CommonModule,
    PeShopBuilderRoutingModule,
    PePlatformHeaderModule,
    PebThemesModule,
    PebShopModule,
    PebEditorModule.forRoot({
      providers: [],
      behaviours: [],
      makers: [],
    }),
  ],
  declarations: [
    PeShopBuilderComponent,
    PeShopThemesComponent,
    PeShopEditorComponent,
    PeShopCreateComponent,
    PeShopListComponent,
    PeShopSettingsComponent,
  ],
  providers: [],
})
export class PeShopBuilderModule { }
