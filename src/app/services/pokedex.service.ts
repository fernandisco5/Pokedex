import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemon(nameOrId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon/${nameOrId}`);
  }
  getAllPokemons(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon?limit=1302`);
  }
  getPokemonTypes(id: string): Observable<any> {
    return this.http.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  }
  getAllTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/type`);
  }
  getPokemonsByType(type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/type/${type}`);
  }
 
}
