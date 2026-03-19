# Testes de Integração no Backend

## O que são Testes de Integração?

Testes de integração são testes automatizados que verificam se diferentes módulos ou componentes de um sistema funcionam corretamente quando integrados. Ao contrário dos testes unitários, que testam pequenas unidades isoladas de código, os testes de integração focam na interação entre várias partes do sistema, como classes, bancos de dados, APIs externas, entre outros.

## Por que são Importantes?

Testes de integração ajudam a:

- Garantir que os diferentes componentes do sistema funcionem bem juntos.
- Detectar problemas que possam surgir da interação entre módulos, como erros de comunicação ou incompatibilidades.
- Validar cenários de uso realistas, onde múltiplas partes do sistema precisam interagir.

## Configuração do Ambiente

Para começar a escrever testes de integração em um projeto backend utilizando C#, siga os passos abaixo:

1. **Instale o .NET SDK**: Certifique-se de ter o [.NET SDK](https://dotnet.microsoft.com/download) instalado.

2. **Crie um projeto de testes**: No terminal, navegue até o diretório do seu projeto e execute o seguinte comando para criar um projeto de testes usando xUnit:

    ```bash
    dotnet new xunit -o tests
    ```

3. **Adicione uma referência ao seu projeto principal**: No diretório do projeto de testes, adicione uma referência ao seu projeto principal:

    ```bash
    dotnet add reference ../src/MyProject.csproj
    ```

4. **Configure um banco de dados para testes**: Se seu projeto interage com um banco de dados, considere usar um banco de dados em memória ou configurar um ambiente de banco de dados separado para os testes.

5. **Organize sua estrutura de diretórios**: Uma estrutura comum de projeto é a seguinte:

    ```
    MyProject/
    ├── src/
    │   └── MyProject.cs
    └── tests/
        └── MyProject.IntegrationTests.cs
    ```

## Exemplo de Teste de Integração

Vamos supor que temos um método na classe `UserService` que adiciona um usuário a um banco de dados. Queremos testar se esse método funciona corretamente ao interagir com o banco de dados.

### Código de Exemplo

Aqui está a implementação da classe `UserService`:

```csharp
// src/MyProject.cs

using System.Data.SqlClient;

namespace MyProject
{
    public class UserService
    {
        private readonly string _connectionString;

        public UserService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public void AddUser(string name, string email)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                var command = new SqlCommand("INSERT INTO Users (Name, Email) VALUES (@Name, @Email)", connection);
                command.Parameters.AddWithValue("@Name", name);
                command.Parameters.AddWithValue("@Email", email);
                command.ExecuteNonQuery();
            }
        }

        public int GetUserCount()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                var command = new SqlCommand("SELECT COUNT(*) FROM Users", connection);
                return (int)command.ExecuteScalar();
            }
        }
    }
}
