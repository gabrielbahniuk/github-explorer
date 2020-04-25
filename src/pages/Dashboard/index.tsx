import React, { useState, useEffect, FormEvent } from 'react';
import { FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.svg';
import { Title, Form, Repositories, Error } from './styles';
import api from '../../services/api';

interface Repository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [newRepo, setNewRepo] = useState('');
  const [inputError, setInputError] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const storagedRepositories = localStorage.getItem(
      '@github_explorer:repositories',
    );
    return storagedRepositories ? JSON.parse(storagedRepositories) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      '@github_explorer:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  function handleRemoveRepository(repository: Repository): void {
    let parsedRepositories = JSON.parse(
      localStorage.getItem('@github_explorer:repositories') || '{}',
    );
    parsedRepositories = parsedRepositories.filter(
      (currentRepository: Repository) =>
        currentRepository.full_name !== repository.full_name,
    );
    setRepositories(parsedRepositories);
  }

  async function handleAddRepository(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!newRepo) {
      setInputError('Inform author/repository.');
      return;
    }
    try {
      const { data } = await api.get<Repository>(`repos/${newRepo}`);

      setRepositories([...repositories, data]);
      setNewRepo('');
      setInputError('');
    } catch (err) {
      setInputError('Repository not found.');
    }
  }

  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>Explore repositories on Github.</Title>

      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          type="text"
          placeholder="Type the repository name..."
          value={newRepo}
          onChange={(evt) => setNewRepo(evt.target.value)}
        />
        <button type="submit">Search</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repositories>
        {repositories &&
          repositories.map((repository) => (
            <section key={repository.full_name}>
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
              />
              <div>
                <strong>{repository.full_name}</strong>
                <p>{repository.description}</p>
              </div>
              <Link to="/" title="Delete">
                <FiTrash2
                  size={23}
                  onClick={() => handleRemoveRepository(repository)}
                />
              </Link>
              <Link to={`/repositories/${repository.full_name}`} title="Access">
                <FiChevronRight size={23} />
              </Link>
            </section>
          ))}
      </Repositories>
    </>
  );
};

export default Dashboard;
