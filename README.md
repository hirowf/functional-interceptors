# Angular 15: Interceptors funcionais

O Lançamento do Angular 14 tornou possível usar a função "inject" fora do contexto de injeção. Isso desbloqueou algumas funcionalidades, como:

* O padrão de composição
* A criação de guards como uma função simples

Com o lançamento do Angular 15, é a vez dos Interceptors se beneficiarem dessa abordagem. No entanto, os interceptors estão ligados à instância do httpClient e, com a introdução dos módulos opcionais (Standalone), surgem várias perguntas:

* Como registrar agora o httpClient?
* Como escrever um interceptor como uma função simples?
* Como registrá-lo?
* É possível ter interceptors como classes e interceptors como funções na mesma aplicação?

## Nova forma de registrar o client http

Antes do lançamento do Angular 15, se quiséssemos inicializar em um componente independe e fornecer o cliente http do Angular, teríamos que usar a função `importProvidersFrom(module)` que custava de:

* importando os provedore exportados pelo módulo
* cadastrando os provedores no ambiente injetor

```ts
bootstrapApplication(AppCmp, {
 providers[importProvidersFrom(HttpClientModule)]
}).catch(console.error)
```

Agora, a partir do Angualar 15, foi adiciona uma função chamada `providHttpClient()` que permite simplesmente registrar o **httpClient**.

```ts
boostrapApplication(AppCmp, {
    providers: [provideHttpClient()]
})
```

## A nova maneira de escrever interceptadores e registrá-los

Antes da v15, um **interceptor** sempre era uma classe precedida pela anotação @Injectable. Abaixo um exemplo:

```ts
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          console.log('this is client side error');
          errorMsg = `Error: ${error.error.message}`;
        } else {
          console.log(`this is serve side error`);
          errorMsg = `Error Code: ${error.status}, Message: ${error.message}`;
        }
        console.log(errorMsg);
        return throwError(() => errorMsg);
      }),
    );
  }
}

```

Graças ao fato da função inject pode ser usada fora do contexto de injeção, esta classe pode ser transformada em uma função.

```ts
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';
      if (error.error instanceof ErrorEvent) {
        console.log('this is client side error');
        errorMsg = `Client Error: ${error.error.message}`;
      } else {
        console.log('this is server side error');
        errorMsg = `Server Error Code: ${error.status}, Message: ${error.message}`;
      }

      console.log(errorMsg);
      return throwError(() => errorMsg);
    }),
  );
};

```

Uma função interceptor leva dois parâmetros

* A solicitação na qual o interceptador irá interagir
* uma função que permite enviar a solicitação transformada

O retorno desta função deve ser um **Observable<HttpEvent<any>>** do tipo HttpEvent para poder interagir com a resposta da solicitação http.
    
Para adicionar uma função de interceptor na instancia httpClient, é fornecido uma nova função **withInterceptors()**.
    
Esta função toma como parametro um array de função de interceptores e retorna um HttpFeature do tipo interceptor. Este tipo de retorno é muito útil porque permite posteriormente chamar função na função **provideHttpClient()**.
    
Exemplo:
    
```ts
import {httpErrorInterceptor} from '@interceptors'
    
boostrapApplication(AppCmp, {
    providers: [provideHttpClient(withInterceptors([HttpErrorInterceptor]))]
}).catch(console.error)
```
    
Existem muitas outras funções que retornam um HttpFeature. É o caso, por exemplo, das funções
    
* `withXsrfConfiguration()` que permite a customização da proteção XSRF
* `withJsonpSupport()` que permite o suporte de JSONP em solicitações Http.|

Mais informações [Aqui]( https://angular.io/api/common/http/provideHttpClient)

## É possível misturar?

Em um aplicação Angular, agora é posível ter components e módulos independetes. Esta coabitação pode ser muito prática se voce dejeja migrar passo a passo uma aplicação baseada em módulos para uma aplicação baseada apenas em componentes autônomos.

Nessa idea, se nossa aplicação inicializar agora em componentes standalone e assim usarmos a função provideHttpClient para registrar o httpClient, será necessário migrar todos os interceptors para o novo formato de função?

A resposta é não. É possível fazer coexistir Interceptadores em formato de função e Interceptadores em formato de classo. Para fazer isso, o Angular nos fornece uma função especial: `withInterceptorsFromDi()`

A função `withInterceptoresFromDi()` tem como objetivo adicionar os interceptors cadastrados no formato antigo:

```ts
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LegacyInterceptor
    multi: true
  }
```

para a instancia httpClient:

```ts
  bootstrapApplication(AppCmp, {
    providers: [provideHttpClient(withInterceptorsFromDi()]
}).catch(console.error)
```

## Conclusão
Angular com a adição de componentes Standalone(independentes) estabilizados permite continuar a remoção dos módulos por completo. A nova sintaxe dos interceptors em formato de funções é mais leve que a anterior.

Graças as funções withInterceptors e withInterceptorsFromDi, os interceptors podem ser migrados passo a passo.

Porém, prefira a partir de agora a sintaxe em formato de função e o uso do withInterceptors pois a função withInterceptorsFromDi corre o risco de ser removida em versões futuras do framework.
