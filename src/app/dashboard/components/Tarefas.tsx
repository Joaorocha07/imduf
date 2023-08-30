'use client'

import { Box, Checkbox, IconButton, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from "@mui/material"
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect } from "react";
import { Tarefa } from "@/types/tarefa";
import ModalVisuTarefas from "./ModalVisuTarefas";

export default function Tarefas() {
    const [tarefas, setTarefas] = React.useState<Tarefa[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [paginaAtual, setPaginaAtual] = React.useState(1);
    const [tarefaSelecionada, setTarefaSelecionada] = React.useState<Tarefa | null>(null);
    const [tarefasSelecionadas, setTarefasSelecionadas] = React.useState<string[]>([]);
    const [todosSelecionados, setTodosSelecionados] = React.useState(false);
    const tarefasPorPagina = 6;

    const openModal = (tarefa: Tarefa): void => {
        setTarefaSelecionada(tarefa);
        setIsModalOpen(true)
    }
    
    const closeModal = (): void => {
        setTarefaSelecionada(null);
        setIsModalOpen(false)
    }

    const toggleTarefaSelecionada = (tarefaId: string) => {
        if (tarefasSelecionadas.includes(tarefaId)) {
            setTarefasSelecionadas(tarefasSelecionadas.filter(id => id !== tarefaId));
        } else {
            setTarefasSelecionadas([...tarefasSelecionadas, tarefaId]);
        }
    };
    
    const toggleTodosSelecionados = () => {
        if (todosSelecionados) {
            setTarefasSelecionadas([]);
        } else {
            const idsTarefas = tarefas.map(tarefa => tarefa.id);
            setTarefasSelecionadas(idsTarefas);
        }
        setTodosSelecionados(!todosSelecionados);
    };

    useEffect(() => {
        const storedTarefas = localStorage.getItem('tarefas');
        if (storedTarefas) {
            setTarefas(JSON.parse(storedTarefas));
        }

        const intervalId = setInterval(() => {
            const storedTarefas = localStorage.getItem('tarefas');
            if (storedTarefas) {
                setTarefas(JSON.parse(storedTarefas));
            }
        }, 600); 

        return () => clearInterval(intervalId);
    }, []);

    function extrairPrimeiras4Palavras(texto: string): string {
        const palavras = texto.split(' ');
        const primeiras4Palavras = palavras.slice(0, 4).join(' ');
        return primeiras4Palavras;
    }

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setPaginaAtual(page);
    };

    const handleExcluirTarefas = (idsTarefas: string[]) => {
        const usuarioLogadoString = localStorage.getItem('usuarioLogado');
        if (usuarioLogadoString !== null) {
            const usuarioLogado = JSON.parse(usuarioLogadoString);
            const tarefasDoUsuarioLogado = tarefas.filter(tarefa => tarefa.userId === usuarioLogado.id);
            const tarefasSelecionadasDoUsuario = tarefasDoUsuarioLogado.filter(tarefa => idsTarefas.includes(tarefa.id));

            // Se as tarefas selecionadas forem todas do usuário logado, exclua-as.
            if (tarefasSelecionadasDoUsuario.length === idsTarefas.length) {
                const tarefasAtualizadas = tarefas.filter(tarefa => !idsTarefas.includes(tarefa.id));
                setTarefas(tarefasAtualizadas);
                setTarefasSelecionadas([]);

                // Atualize o armazenamento local com as tarefas atualizadas, se necessário.
                localStorage.setItem('tarefas', JSON.stringify(tarefasAtualizadas));
            } else {
                // Caso contrário, mostre uma mensagem de erro ou aviso.
                alert('Ainda não tem como apagar todos de uma vez!');
            }
        }
    };  

    const openModalForTarefa = (tarefa: Tarefa) => {
        setTarefaSelecionada(tarefa);
        setIsModalOpen(true);
    };

    const renderTarefas = (): any => {
        const listaIncial = (paginaAtual - 1) * tarefasPorPagina;
        const listaFinal = Math.min(listaIncial + tarefasPorPagina, tarefas.length);

        const usuarioLogadoString = localStorage.getItem('usuarioLogado');

        if (usuarioLogadoString !== null) {

            const usuarioLogado = JSON.parse(usuarioLogadoString);

            const tarefasDoUsuarioLogado = tarefas.filter(tarefa => tarefa.userId === usuarioLogado.id);

            return tarefasDoUsuarioLogado.slice(listaIncial, listaFinal).map((tarefa) => (
                    <TableRow
                        key={tarefa.id}
                        sx={{
                            transition: "background-color 0.3s",
                            cursor: "pointer",
                            "&:hover": {
                                backgroundColor: "rgba(173, 216, 230, 0.5)", 
                            },
                        }}
                    >
                        <TableCell>
                            <Checkbox
                                checked={tarefasSelecionadas.includes(tarefa.id)}
                                onChange={() => toggleTarefaSelecionada(tarefa.id)}
                            />
                        </TableCell>
                        <TableCell onClick={() => openModalForTarefa(tarefa)}>{tarefa.titulo}</TableCell>
                        <TableCell onClick={() => openModalForTarefa(tarefa)}>{extrairPrimeiras4Palavras(tarefa.conteudo)}</TableCell>
                        <TableCell onClick={() => openModalForTarefa(tarefa)}>{tarefa.prazoIncial}</TableCell>
                        <TableCell onClick={() => openModalForTarefa(tarefa)}>{tarefa.prazoFinal}</TableCell>
                        <TableCell onClick={() => openModalForTarefa(tarefa)}>
                            <div
                                style={{
                                    width: "20px", 
                                    height: "20px",
                                    borderRadius: '5px',
                                    backgroundColor: `${tarefa.cor}`,
                                }}
                            />
                        </TableCell>
                    </TableRow>
            ));
        }
    };
    
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');

    let totalTarefasUsuarioLogado = 0;

    if (usuarioLogadoString !== null) {

        const usuarioLogado = JSON.parse(usuarioLogadoString);
        
        const tarefasDoUsuarioLogado = tarefas.filter(tarefa => tarefa.userId === usuarioLogado.id);
        totalTarefasUsuarioLogado = tarefasDoUsuarioLogado.length;
        const totalPages = Math.ceil(totalTarefasUsuarioLogado / tarefasPorPagina);
    }

    return (
        <>
            {isModalOpen && (
                <ModalVisuTarefas isOpen={isModalOpen} onClose={closeModal} tarefaSelecionada={tarefaSelecionada} />
            )}

            <Box
                sx={{ 
                    display: 'flex',
                    alignItems: "flex-start",
                    justifyContent: 'space-between',
                    width: '80%',
                    height: '74vh', 
                    borderRadius: '20px',
                    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                    background: '#FFF',
                    padding: '20px', 
                    flexDirection: 'row',
                    margin: 'auto',
                    marginTop: '1.5rem'
                }}
            >
                <TableContainer>
                    <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Checkbox checked={todosSelecionados} onChange={toggleTodosSelecionados} />
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>NOME</TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>ATIVIDADE</TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>PRAZO INICIAL</TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>PRAZO FINAL</TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <FilterAltIcon />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {renderTarefas()}
                    </TableBody>
                    </Table>
                    {totalTarefasUsuarioLogado >= tarefasPorPagina && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                                count={Math.ceil(tarefas.length / tarefasPorPagina)}
                                page={paginaAtual}
                                onChange={handlePageChange}
                            />
                        </Box>
                    )}
                    {tarefasSelecionadas.length > 0 && (
                        <IconButton
                            sx={{ mr: 1, ml: 2 }}
                            onClick={() => handleExcluirTarefas(tarefasSelecionadas)}
                            aria-label="Excluir tarefas selecionadas"
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}
                </TableContainer>
            </Box>
        </>
    )
}