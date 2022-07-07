// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// ! FAUCETS
// ! docs.chain.link/docs/link-token-contracts/

/*
 * Para desplegarlo en una red de test ir a la parte de deploy en REMIX
 * seleccionar ENVIRONMENT -> "Injected Web3"
 */

contract SimpleStorage {
    //? las variables se indexan secuencialmente en el orden declaradas

    //* si se añade el atributo public a la variable se crea un getter en el contrato
    uint256 favoriteNumber; //* Si no se inicializa explicitamente, se asigna el valor 0

    //* declaración de un objeto
    People public person = People({favoriteNumber: 2, name: "Guille"});

    mapping(string => uint256) public nameToFavoriteNumber;

    //* creación de un objeto (nuevo tipo de datos propio).
    struct People {
        uint256 favoriteNumber;
        string name;
    }

    //* arrays
    //* se crea un array y a su vez su getter -> se le pasa un número (indice) y devuelve info de todos
    //* sus componentes
    People[] public people;

    // ! FUNCIONES

    //* el coste de la transacción varia en función del número de acciones que lleve a cabo
    function store(uint256 _favoriteNumber) public {
        favoriteNumber = _favoriteNumber;
    }

    //* Solo se gasta gas cuando se modifica la blockchain
    //* Si se accede a datos no gastamos
    function retrieve() public view returns (uint256) {
        return favoriteNumber;
    }

    function addPerson(string memory _name, uint256 _favoriteNumber) public {
        People memory newPerson = People(_favoriteNumber, _name);
        //people.push(People(_favoriteNumber, _name));
        people.push(newPerson);
        nameToFavoriteNumber[_name] = _favoriteNumber;
    }

    // ! ACCESOS A LA INFORMACIÓN
    /*
    * Stack:
    * Memory: la variable existe temporalmente y SI se puede modificar
    * Calldata: la variable existe temporalmente y NO se puede modificar
    * Storage: la variable se mantiene en el tiempo y SI se puede modificar
    * Code:
    * Logs:
    ? el compilador es "inteligente" y sabe cuando una variable puede o no ser almacenada en memoria
     */
}
