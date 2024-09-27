import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ToastController,InfiniteScrollCustomEvent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokedex.service';
import { PokemonListComponent } from '../pokemon-list/pokemon-list.component';
@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [IonicModule,FormsModule,CommonModule,PokemonListComponent],
})
export class PokedexComponent implements OnInit {
  //Atributos para la visualicación de los pokemons
  pokemons: any[] = [];
  favorites: any[] = [];
  displayed_pokemons: any[] = [];
  pokemons_filtered: any[]=[];
  pokemons_searched:any[]=[];
  search_term: string = '';
  selected_type: string | null = null;
  types: any[] = [];
  //Atributos para la selección de pokemon
  selected_pokemon: any = null;
  pokemon_types: string = '';
  //Atributos para paginar los pokemons
  limit: number =20;
  offset: number = 0;
  //Atributos para controlar la vista
  loading: boolean = true;
  show_more_bottom: boolean = false;
  focused_index: any = {
    pokemons: 0,
    favorites:0,
  };
  current_view: any = {
    pokemons: false,
    favorites: false,
    filtered_pokemons: false,
    selected_pokemon: false,
  };
  last_view: string ='';
  presenting_element: any = null;

  constructor(private pokemonService: PokemonService, private toastController: ToastController) { }
  
  ngOnInit() {
    this.presenting_element = document.querySelector('.ion-page');
    this.loadTypes();
    this.loadPokemons();
  }
  //Carga los tipos de pokemon disponibles
  loadTypes() {
    this.pokemonService.getAllTypes().subscribe(data => {
      this.types = data.results;
    });
  }
  //Carga todos los pokemons
  loadPokemons() {
    try {
      this.pokemonService.getAllPokemons().subscribe({
        next: (data) => {
          this.pokemons = data.results.map((pokemon: { name: string; url: string; }) => {
            const id = pokemon.url.split('/').filter((part: string) => part).pop();
            return {
              name: pokemon.name,
              id: id,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          });
          this.displayed_pokemons = this.pokemons.slice(this.offset, this.limit);
          this.setView('pokemons');
          this.loading = false; 
        },
        error: (error) => {
          console.error('Error cargando los pokemons:', error);
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error cargando los pokemons:', error);
      this.loading = false;
    }
  }
  //Selecciona un pokemon
  selectPokemon(pokemon: any) {
    this.selected_pokemon = this.pokemons.find(p => p.id === pokemon.id);
    if (this.selected_pokemon) {
      this.pokemonService.getPokemon(this.selected_pokemon.name).subscribe({
        next: (data) => {
          const { id,name,types, ...rest } = data;
          this.selected_pokemon = {
            ...this.selected_pokemon,
            ...rest,
          }
          this.pokemon_types = data.types.map((type: any) => type.type.name).join(', ');
          this.setView('selected_pokemon');
        },
        error: (error) => {
          console.error('Error loading pokemon:', error);
        }
      });
    }
  }
  //Busca un pokemon por id o por nombre, busca en la lista actual, si hay un filtro activo solo busca en ese filtro
  searchPokemon() {
    const term = this.search_term.toLowerCase();
    this.limit=20;
    this.offset=0;
    const pokemons = this.pokemons_filtered.length===0 ? this.pokemons : this.pokemons_filtered;
    if(term){
      this.pokemons_searched = pokemons.filter(pokemon => 
        pokemon.name.toLowerCase()===term || pokemon.id===term
      );
      if(this.pokemons_searched[0])
        this.selectPokemon(this.pokemons_searched[0]);
    }else{
      this.selected_pokemon=null;
      this.setView('pokemons');
    }
  }
  //Funcion que se aplica a los chechbox para filtrar
  toggleTypeSelection(type: string) {
    if (this.selected_type === type) {
      this.selected_type = null;
    } else {
      this.selected_type = type;
    }
    this.filterPokemons();
  }
  //Filtras los pokemons por tipo
  filterPokemons() {
    this.pokemons_filtered = [];
    this.limit=20;
    this.offset=0;
    //const pokemons = this.pokemons_searched.length===0 ? this.pokemons : this.pokemons_searched;
    if (!this.selected_type) {
      this.displayed_pokemons = this.pokemons.slice(this.offset, this.limit);
    } else {
      this.loading = true;
      this.pokemonService.getPokemonsByType(this.selected_type).subscribe({
        next: (data) => {
          this.pokemons_filtered = data.pokemon.map((p: { pokemon: { name: string; url: string; } }) => {
            const id = p.pokemon.url.split('/').filter((part: string) => part).pop();
            //if (this.pokemons.some(pokemon => pokemon.id === id)) {
              return {
                name: p.pokemon.name,
                id: id,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
              };
           //}else
           // return null;
              
          });//.filter((pokemon: { name: string; id: string; image: string } | null) => pokemon !== null);
          console.log(`Pokemons del tipo: ${this.selected_type}: ${this.pokemons_filtered.length}`);
          this.displayed_pokemons = this.pokemons_filtered.slice(this.offset, this.limit);
          this.focused_index.pokemons=0;
          this.setView('pokemons');
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading pokemon:', error);
          this.loading = false;
        }
      });
    }
  }
  async toast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    toast.present();
  }
  addToFavorites(pokemon: any) {
    if(!this.favorites.some(fav => fav.id === pokemon.id)){
      this.favorites.push(pokemon);
      this.toast(`${pokemon.name} was added to favorites`);
    }
  }
  removeFromFavorites(pokemon: any) {
    this.favorites = this.favorites.filter(fav => fav.id !== pokemon.id);
    this.toast(`${pokemon.name} has been removed from your favorites`);
  }
  isFavorite(pokemon: any): boolean {
    return this.favorites.some(fav => fav.id === pokemon.id);
  }
  toggleFavorite(pokemon: any) {
    if (this.isFavorite(pokemon)) {
      this.removeFromFavorites(pokemon);
    } else {
      this.addToFavorites(pokemon);
    }
  }
  private generateItems() {
    this.offset += this.limit;
    const pokemons = this.pokemons_filtered.length===0 ? this.pokemons : this.pokemons_filtered;
    if(this.offset<=pokemons.length)
       this.displayed_pokemons = this.displayed_pokemons.concat(pokemons.slice(this.offset, this.offset + this.limit));
  }
  onIonInfinite(ev:InfiniteScrollCustomEvent) {
    this.generateItems();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }
  resetScreen(){
    this.search_term='';
    this.setView('pokemons');
    
  }
  restoreFocus(list_name: string) {
    const focused_element = document.querySelector(`#${list_name}-list ion-item:nth-child(${this.focused_index[list_name] + 1})`);
    if (focused_element) {
        focused_element.scrollIntoView({ block: 'center' });
    }
  }
  moveFocus(direction: string) {
    const list_name = this.getView();
    if(list_name === 'pokemons' || list_name === 'favorites'){
      const list_pokemons = list_name === 'favorites' ? this.favorites : this.displayed_pokemons;
      if (direction === 'up' && this.focused_index[list_name] > 0) {
        this.focused_index[list_name]--;
      } else if (direction === 'down' && this.focused_index[list_name]<(list_pokemons.length -1)) {
        this.focused_index[list_name]++;
      }
      this.restoreFocus(list_name);
    }
    
  }
  viewFavorites(){
    const view = this.getView();
    this.search_term='';
    if(view!=='favorites'){
      this.setView('favorites');
    }else{
      this.setView('pokemons');
    }
  }
  selectItem() {
    const list_name = this.getView();
    if(list_name === 'pokemons' || list_name === 'favorites'){
      const list_pokemons = list_name === 'favorites' ? this.favorites : this.displayed_pokemons;
      this.selected_pokemon = list_pokemons[this.focused_index[list_name]];
      this.selectPokemon(this.selected_pokemon);
    }
  }
  setView(view: string) {
    for (let key in this.current_view) {
      if (this.current_view.hasOwnProperty(key)) {
        if(this.current_view[key] && key!==view)
          this.last_view = key;
        this.current_view[key] = false;
      }
    }
    if (this.current_view.hasOwnProperty(view)) {
      this.current_view[view] = true;
      if(view==='pokemons' || view==='favorites')
        setTimeout(() => this.restoreFocus(view), 0);
    } else {
      console.error("Invalid view:", view);
      this.current_view.pokemons = true;
    }
  }
  getView(): string {
    for (let key in this.current_view) {
      if (this.current_view[key] && this.current_view.hasOwnProperty(key)) {
        return key;
      }
    }
    return '';
  }
}
