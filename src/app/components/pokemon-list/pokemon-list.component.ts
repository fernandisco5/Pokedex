import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PokemonListComponent {
  @Input() pokemons: any[] = [];
  @Input() list_name: string = '';
  @Input() focused_index: any = {};
  @Input() getPokemon: (pokemon: any) => void = () => {};
  @Input() selectPokemon: (pokemon: any) => void = () => {};
  @Input() toggleFavorite: (pokemon: any) => void = () => {};
  @Input() isFavorite: (pokemon: any) => boolean = () => false;
 
}