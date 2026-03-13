-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 13/03/2026 às 11:09
-- Versão do servidor: 10.11.10-MariaDB-log
-- Versão do PHP: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u268549871_saaas`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `apontamentos`
--

CREATE TABLE `apontamentos` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `funcionario_id` int(11) NOT NULL,
  `funcionario_nome_snapshot` varchar(200) DEFAULT NULL,
  `funcionario_passaporte_snapshot` varchar(50) DEFAULT NULL,
  `obra_id` int(11) NOT NULL,
  `obra_nome_snapshot` varchar(200) DEFAULT NULL,
  `obra_numero_snapshot` varchar(50) DEFAULT NULL,
  `semana_inicio` date NOT NULL COMMENT 'Segunda-feira da semana',
  `horas_diarias` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '{"mon": 8, "tue": 8, ...}' CHECK (json_valid(`horas_diarias`)),
  `total_horas` decimal(6,2) DEFAULT 0.00,
  `horas_normais` decimal(5,1) DEFAULT 0.0,
  `horas_extra` decimal(5,1) DEFAULT 0.0,
  `horas_noturna` decimal(5,1) DEFAULT 0.0,
  `status` enum('rascunho','enviado','aprovado_encarregado','aprovado','rejeitado') NOT NULL DEFAULT 'rascunho',
  `observacao_rejeicao` text DEFAULT NULL,
  `enviado_em` datetime DEFAULT NULL,
  `aprovado_em` datetime DEFAULT NULL,
  `aprovado_admin_em` datetime DEFAULT NULL,
  `aprovado_por` int(11) DEFAULT NULL,
  `aprovado_admin_por` int(11) DEFAULT NULL,
  `assinatura_base64` longtext DEFAULT NULL,
  `assinatura_admin_base64` longtext DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletado_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `apontamentos`
--

INSERT INTO `apontamentos` (`id`, `tenant_id`, `funcionario_id`, `funcionario_nome_snapshot`, `funcionario_passaporte_snapshot`, `obra_id`, `obra_nome_snapshot`, `obra_numero_snapshot`, `semana_inicio`, `horas_diarias`, `total_horas`, `horas_normais`, `horas_extra`, `horas_noturna`, `status`, `observacao_rejeicao`, `enviado_em`, `aprovado_em`, `aprovado_admin_em`, `aprovado_por`, `aprovado_admin_por`, `assinatura_base64`, `assinatura_admin_base64`, `criado_em`, `atualizado_em`, `deletado_em`) VALUES
(18, 1, 20, NULL, NULL, 20, NULL, NULL, '2026-03-03', '{\"mon\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"tue\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"wed\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"thu\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"fri\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"}}', 9.00, 8.0, 1.0, 0.0, 'enviado', NULL, '2026-03-05 21:06:29', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-05 21:06:15', '2026-03-05 21:06:29', NULL),
(19, 1, 20, NULL, NULL, 21, NULL, NULL, '2026-03-03', '{\"mon\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"tue\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"wed\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"thu\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"fri\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"}}', 9.00, 8.0, 1.0, 0.0, 'enviado', NULL, '2026-03-05 21:42:37', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-05 21:41:59', '2026-03-05 21:42:37', NULL),
(27, 1, 24, NULL, NULL, 38, NULL, NULL, '2026-03-09', '{\"mon\":{\"normal\":0.5,\"extra\":0.5,\"noturna\":0.5},\"tue\":{\"normal\":0.5,\"extra\":0.5,\"noturna\":0.5},\"wed\":{\"normal\":0.5,\"extra\":0.5,\"noturna\":0.5},\"thu\":{\"normal\":0.5,\"extra\":0.5,\"noturna\":0.5},\"fri\":{\"normal\":0.5,\"extra\":0.5,\"noturna\":0.5},\"sat\":{\"normal\":0.5,\"extra\":0.5,\"noturna\":\"\"}}', 8.50, 3.0, 3.0, 2.5, 'rascunho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-12 20:14:24', '2026-03-12 20:14:37', NULL),
(28, 1, 24, NULL, NULL, 38, NULL, NULL, '2026-03-10', '{\"mon\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"tue\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"wed\":{\"normal\":1.5,\"extra\":\"\",\"noturna\":\"\"},\"thu\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"fri\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"}}', 1.50, 1.5, 0.0, 0.0, 'rascunho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-13 01:08:04', '2026-03-13 01:08:21', NULL),
(29, 1, 13, NULL, NULL, 18, NULL, NULL, '2026-03-02', '{\"mon\":{\"normal\":8,\"extra\":2,\"noturna\":\"\"},\"tue\":{\"normal\":8,\"extra\":2,\"noturna\":\"\"},\"wed\":{\"normal\":8,\"extra\":2,\"noturna\":\"\"},\"thu\":{\"normal\":8,\"extra\":2,\"noturna\":\"\"},\"fri\":{\"normal\":8,\"extra\":2,\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"}}', 50.00, 40.0, 10.0, 0.0, 'rascunho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-13 02:37:00', '2026-03-13 02:37:29', NULL),
(30, 1, 13, NULL, NULL, 18, NULL, NULL, '2026-03-09', '{\"mon\":{\"normal\":8,\"extra\":2,\"noturna\":\"\"},\"tue\":{\"normal\":8,\"extra\":2,\"noturna\":\"\"},\"wed\":{\"normal\":8,\"extra\":2,\"noturna\":\"\"},\"thu\":{\"normal\":8,\"extra\":\"\",\"noturna\":\"\"},\"fri\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"}}', 38.00, 32.0, 6.0, 0.0, 'rascunho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-13 02:38:03', '2026-03-13 02:39:04', NULL),
(31, 1, 20, NULL, NULL, 21, NULL, NULL, '2026-03-02', '{\"mon\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"tue\":{\"normal\":8,\"extra\":\"\",\"noturna\":\"\"},\"wed\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"thu\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"fri\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":5,\"noturna\":\"\"}}', 40.00, 32.0, 8.0, 0.0, 'rascunho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-13 02:50:02', '2026-03-13 02:50:56', NULL),
(32, 1, 20, NULL, NULL, 21, NULL, NULL, '2026-03-09', '{\"mon\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"tue\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"wed\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"thu\":{\"normal\":8,\"extra\":\"\",\"noturna\":\"\"},\"fri\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"}}', 35.00, 32.0, 3.0, 0.0, 'rascunho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-13 02:51:06', '2026-03-13 02:51:42', NULL),
(33, 1, 21, NULL, NULL, 21, NULL, NULL, '2026-03-02', '{\"mon\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"tue\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"wed\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"thu\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"fri\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"}}', 36.00, 32.0, 4.0, 0.0, 'rascunho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-13 02:56:50', '2026-03-13 02:57:14', NULL),
(34, 1, 21, NULL, NULL, 21, NULL, NULL, '2026-03-09', '{\"mon\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"tue\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"wed\":{\"normal\":8,\"extra\":1,\"noturna\":\"\"},\"thu\":{\"normal\":8,\"extra\":\"\",\"noturna\":\"\"},\"fri\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"},\"sat\":{\"normal\":\"\",\"extra\":\"\",\"noturna\":\"\"}}', 35.00, 32.0, 3.0, 0.0, 'rascunho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-13 02:57:26', '2026-03-13 02:57:39', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `aprovacao_tokens`
--

CREATE TABLE `aprovacao_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `apontamento_id` int(11) NOT NULL,
  `encarregado_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `usado_em` datetime DEFAULT NULL,
  `expira_em` datetime NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `nome` varchar(200) NOT NULL,
  `documento` varchar(50) DEFAULT NULL,
  `nif` varchar(50) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `email_financeiro` varchar(200) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `pessoa_contato` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes com campos completos: documento, NIF, endereco, pessoa_contato, email_financeiro';

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id`, `tenant_id`, `nome`, `documento`, `nif`, `email`, `email_financeiro`, `telefone`, `endereco`, `pessoa_contato`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 'Construcciones ABC', '', '', 'info@abc.add', 'contactes@j2s.ad', '+376 123 456', '', '', 0, '2026-02-02 18:39:48', '2026-02-19 18:32:08'),
(2, 1, 'SAME', '', '', 'gjimenez@agfs.ad', 'finances@agfs.ad', '+376 811 733', 'testeststesse', '', 1, '2026-03-04 18:22:39', '2026-03-05 19:32:53'),
(3, 1, 'TESTE ENDERECO', '', '', 'teste@teste.com', 'financeiro@teste.com', '123456789', 'Rua Teste 123, Andorra', '', 0, '2026-03-05 19:19:41', '2026-03-05 19:32:47'),
(4, 1, 'AC Construccions (Jordi)', '', '', '', '', '+376 342 503', 'Passeig de I\'Alguer, sn Encamp', '', 1, '2026-03-05 20:29:59', '2026-03-05 21:29:13'),
(5, 1, 'Mantenopolis SL', '', '', 'jmanrique@mantenopolis.com', 'administracion@mantenopolis.com', '+34 618 33 10 27', 'Calle Múrcia n16 piso térreo- 07800 Ibiza (Ilhas Baleares)', '', 1, '2026-03-05 20:33:26', '2026-03-05 20:35:25'),
(6, 1, 'CIP', '', '', 'comptabilitat@cprojectesvl.com', 'comptabilitat@cprojectesvl.com', '+376 804 080', 'Av Fiter i Rossell, 70 baixo 2', '', 1, '2026-03-05 21:18:09', '2026-03-05 21:18:09'),
(7, 1, 'Cliente Teste Guilherme e Cassio', '', '', '', '', '', '', '', 1, '2026-03-10 18:32:10', '2026-03-10 18:32:10');

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes`
--

CREATE TABLE `configuracoes` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `chave` varchar(100) NOT NULL,
  `valor` text DEFAULT NULL,
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `configuracoes`
--

INSERT INTO `configuracoes` (`id`, `tenant_id`, `chave`, `valor`, `atualizado_em`) VALUES
(1, 1, 'smtp_host', 'email-ssl.com.br', '2026-02-02 18:39:48'),
(2, 1, 'smtp_port', '465', '2026-02-02 18:39:48'),
(3, 1, 'smtp_user', 'contactes@j2s.ad', '2026-02-02 18:39:48'),
(4, 1, 'smtp_password', 'cassio321Cr#', '2026-02-02 18:39:48'),
(5, 1, 'smtp_from', 'contactes@j2s.ad', '2026-02-02 18:39:48'),
(6, 1, 'email_financeiro', 'contactes@j2s.ad', '2026-02-02 18:39:48'),
(7, 1, 'email_admin', 'contactes@j2s.ad', '2026-02-04 15:21:37'),
(8, 1, 'email_j2s', 'contactes@j2s.ad', '2026-02-04 15:21:37');

-- --------------------------------------------------------

--
-- Estrutura para tabela `config_fiscal`
--

CREATE TABLE `config_fiscal` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `cas_desconto_funcionario` decimal(5,2) NOT NULL DEFAULT 6.50 COMMENT 'Percentual de CAS descontado do funcionário',
  `cas_custo_empresa` decimal(5,2) NOT NULL DEFAULT 15.50 COMMENT 'Percentual de CAS custo para empresa',
  `igi_percentual` decimal(5,2) NOT NULL DEFAULT 4.50 COMMENT 'Percentual de IGI sobre faturamento',
  `hora_extra_multiplicador` decimal(3,2) NOT NULL DEFAULT 1.40 COMMENT 'Multiplicador para hora extra (1.4x)',
  `hora_noturna_multiplicador` decimal(3,2) NOT NULL DEFAULT 1.60 COMMENT 'Multiplicador para hora noturna (1.6x)',
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `config_fiscal`
--

INSERT INTO `config_fiscal` (`id`, `tenant_id`, `cas_desconto_funcionario`, `cas_custo_empresa`, `igi_percentual`, `hora_extra_multiplicador`, `hora_noturna_multiplicador`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 6.50, 15.50, 4.50, 1.40, 1.60, '2026-02-05 18:35:42', '2026-02-12 22:02:27');

-- --------------------------------------------------------

--
-- Estrutura para tabela `config_impostos`
--

CREATE TABLE `config_impostos` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `imposto_nome` varchar(50) NOT NULL,
  `percentual` decimal(5,2) NOT NULL,
  `aplicado_em` enum('faturamento','folha_funcionario','folha_empresa') NOT NULL,
  `descricao` text DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `config_impostos`
--

INSERT INTO `config_impostos` (`id`, `tenant_id`, `imposto_nome`, `percentual`, `aplicado_em`, `descricao`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 'IGI', 4.50, 'faturamento', 'Imposto Geral Indireto - 4,5% sobre o valor da nota ao cliente', 1, '2026-02-06 22:20:41', '2026-03-06 19:51:08'),
(2, 1, 'CAS Funcionário', 6.50, 'folha_funcionario', 'Caixa de Segurança Social - Desconto de 6,5% do salário do funcionário', 1, '2026-02-06 22:20:41', '2026-02-06 22:20:41'),
(3, 1, 'CAS Empresa', 15.50, 'folha_empresa', 'Caixa de Segurança Social - Custo patronal de 15,5% sobre a folha', 1, '2026-02-06 22:20:41', '2026-02-06 22:20:41');

-- --------------------------------------------------------

--
-- Estrutura para tabela `config_valores`
--

CREATE TABLE `config_valores` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `valor_hora_normal` decimal(10,2) DEFAULT 21.00,
  `valor_hora_extra` decimal(10,2) DEFAULT 28.00,
  `valor_hora_noturna` decimal(10,2) DEFAULT 30.00,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp(),
  `fatura_hora_normal` decimal(10,2) DEFAULT 25.00,
  `fatura_hora_extra` decimal(10,2) DEFAULT 37.50,
  `fatura_hora_noturna` decimal(10,2) DEFAULT 50.00,
  `multiplicador_extra` decimal(5,2) DEFAULT 1.50,
  `multiplicador_noturna` decimal(5,2) DEFAULT 2.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `config_valores`
--

INSERT INTO `config_valores` (`id`, `tenant_id`, `valor_hora_normal`, `valor_hora_extra`, `valor_hora_noturna`, `criado_em`, `atualizado_em`, `fatura_hora_normal`, `fatura_hora_extra`, `fatura_hora_noturna`, `multiplicador_extra`, `multiplicador_noturna`) VALUES
(1, 1, 21.00, 28.00, 30.00, '2026-02-03 22:00:03', '2026-02-03 22:00:03', 25.00, 37.50, 50.00, 1.50, 2.00),
(2, 1, 15.00, 22.50, 30.00, '2026-02-04 15:21:37', '2026-03-06 19:51:55', 25.00, 37.50, 50.00, 1.40, 1.60);

-- --------------------------------------------------------

--
-- Estrutura para tabela `config_valores_faturamento`
--

CREATE TABLE `config_valores_faturamento` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `valor_hora_normal_faturamento` decimal(10,2) NOT NULL DEFAULT 30.00 COMMENT 'Valor cobrado do cliente por hora normal',
  `valor_hora_extra_faturamento` decimal(10,2) NOT NULL DEFAULT 42.00 COMMENT 'Valor cobrado do cliente por hora extra',
  `valor_hora_noturna_faturamento` decimal(10,2) NOT NULL DEFAULT 48.00 COMMENT 'Valor cobrado do cliente por hora noturna',
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `config_valores_faturamento`
--

INSERT INTO `config_valores_faturamento` (`id`, `tenant_id`, `valor_hora_normal_faturamento`, `valor_hora_extra_faturamento`, `valor_hora_noturna_faturamento`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 30.00, 42.00, 48.00, '2026-02-05 18:35:42', '2026-02-05 18:35:42');

-- --------------------------------------------------------

--
-- Estrutura para tabela `despesas_indiretas`
--

CREATE TABLE `despesas_indiretas` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `obra_id` int(11) NOT NULL,
  `mes_referencia` char(7) NOT NULL,
  `locacao_escritorio` decimal(12,2) DEFAULT 0.00,
  `locacao_deposito` decimal(12,2) DEFAULT 0.00,
  `fornecedores` decimal(12,2) DEFAULT 0.00,
  `ferramentas` decimal(12,2) DEFAULT 0.00,
  `uniformes` decimal(12,2) DEFAULT 0.00,
  `taxa_imigracao` decimal(12,2) DEFAULT 0.00,
  `cartao_transporte` decimal(12,2) DEFAULT 0.00,
  `outros` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) GENERATED ALWAYS AS (`locacao_escritorio` + `locacao_deposito` + `fornecedores` + `ferramentas` + `uniformes` + `taxa_imigracao` + `cartao_transporte` + `outros`) STORED,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `encarregados`
--

CREATE TABLE `encarregados` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `passaporte` varchar(50) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL COMMENT 'Hash da senha para login',
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `encarregados`
--

INSERT INTO `encarregados` (`id`, `tenant_id`, `nome`, `email`, `telefone`, `passaporte`, `senha`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(5, 1, 'GUILHERME ENCARREGADO TESTE', '', '+55 11 98331-9722', '010203', '$2y$10$wR0iMRCU5BqyXLL5txb2I.0SEXbw9snT5Dz4eKYS7ZpQoMvx8YJNO', 1, '2026-03-10 18:43:06', '2026-03-11 00:47:57'),
(12, 1, 'HUGO SAMEE', NULL, '+376 354 647', NULL, NULL, 1, '2026-03-11 00:47:10', '2026-03-12 23:50:29'),
(13, 1, 'Manel AC Construccions ', NULL, '+376 334 731', NULL, NULL, 1, '2026-03-12 22:56:30', '2026-03-12 22:56:30'),
(14, 1, 'Jorge Mantenopolis', NULL, '+34 618 33 10 27', NULL, NULL, 1, '2026-03-12 22:58:34', '2026-03-12 22:58:34');

-- --------------------------------------------------------

--
-- Estrutura para tabela `faturamento`
--

CREATE TABLE `faturamento` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `obra_id` int(11) NOT NULL,
  `mes_referencia` varchar(7) NOT NULL COMMENT 'YYYY-MM',
  `horas_normais` decimal(10,2) DEFAULT 0.00,
  `horas_extra` decimal(10,2) DEFAULT 0.00,
  `horas_noturna` decimal(10,2) DEFAULT 0.00,
  `valor_hora_normal` decimal(10,2) NOT NULL,
  `valor_hora_extra` decimal(10,2) NOT NULL,
  `valor_hora_noturna` decimal(10,2) NOT NULL,
  `valor_total_servicos` decimal(10,2) NOT NULL,
  `igi_percentual` decimal(5,2) DEFAULT 4.50,
  `igi_valor` decimal(10,2) GENERATED ALWAYS AS (`valor_total_servicos` * `igi_percentual` / 100) STORED,
  `valor_total_fatura` decimal(10,2) GENERATED ALWAYS AS (`valor_total_servicos` + `valor_total_servicos` * `igi_percentual` / 100) STORED,
  `observacoes` text DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_bruto` decimal(10,2) DEFAULT 0.00,
  `total_liquido` decimal(10,2) DEFAULT 0.00,
  `total_horas` decimal(10,2) DEFAULT 0.00 COMMENT 'Total de horas faturadas'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `folha_pagamento`
--

CREATE TABLE `folha_pagamento` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `funcionario_id` int(11) NOT NULL,
  `obra_id` int(11) NOT NULL,
  `mes_referencia` varchar(7) NOT NULL COMMENT 'YYYY-MM',
  `horas_normais` decimal(10,2) DEFAULT 0.00,
  `horas_extra` decimal(10,2) DEFAULT 0.00,
  `horas_noturna` decimal(10,2) DEFAULT 0.00,
  `salario_base` decimal(10,2) NOT NULL,
  `salario_hora` decimal(10,2) NOT NULL,
  `vale_moradia` decimal(10,2) DEFAULT 0.00,
  `ibf` decimal(10,2) DEFAULT 0.00,
  `cas_desconto_funcionario_percentual` decimal(5,2) DEFAULT 6.50,
  `cas_custo_empresa_percentual` decimal(5,2) DEFAULT 15.50,
  `valor_horas_normais` decimal(10,2) GENERATED ALWAYS AS (`horas_normais` * `salario_hora`) STORED,
  `valor_horas_extra` decimal(10,2) GENERATED ALWAYS AS (`horas_extra` * `salario_hora` * 1.4) STORED,
  `valor_horas_noturna` decimal(10,2) GENERATED ALWAYS AS (`horas_noturna` * `salario_hora` * 1.6) STORED,
  `subtotal_horas` decimal(10,2) GENERATED ALWAYS AS (`horas_normais` * `salario_hora` + `horas_extra` * `salario_hora` * 1.4 + `horas_noturna` * `salario_hora` * 1.6) STORED,
  `cas_desconto_funcionario_valor` decimal(10,2) GENERATED ALWAYS AS (`salario_base` * `cas_desconto_funcionario_percentual` / 100) STORED,
  `cas_custo_empresa_valor` decimal(10,2) GENERATED ALWAYS AS (`salario_base` * `cas_custo_empresa_percentual` / 100) STORED,
  `total_provimentos` decimal(10,2) GENERATED ALWAYS AS (`horas_normais` * `salario_hora` + `horas_extra` * `salario_hora` * 1.4 + `horas_noturna` * `salario_hora` * 1.6 + `vale_moradia` + `ibf`) STORED,
  `total_descontos` decimal(10,2) GENERATED ALWAYS AS (`salario_base` * `cas_desconto_funcionario_percentual` / 100) STORED,
  `liquido_a_pagar` decimal(10,2) GENERATED ALWAYS AS (`horas_normais` * `salario_hora` + `horas_extra` * `salario_hora` * 1.4 + `horas_noturna` * `salario_hora` * 1.6 + `vale_moradia` + `ibf` - `salario_base` * `cas_desconto_funcionario_percentual` / 100) STORED,
  `custo_total_empresa` decimal(10,2) GENERATED ALWAYS AS (`horas_normais` * `salario_hora` + `horas_extra` * `salario_hora` * 1.4 + `horas_noturna` * `salario_hora` * 1.6 + `vale_moradia` + `ibf` + `salario_base` * `cas_custo_empresa_percentual` / 100) STORED,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `salario_base_hora` decimal(10,2) DEFAULT NULL,
  `multiplicador_extra` decimal(3,2) DEFAULT 1.40,
  `multiplicador_noturna` decimal(3,2) DEFAULT 1.60,
  `cas_funcionario_percentual` decimal(5,2) DEFAULT 6.50,
  `cas_funcionario_valor` decimal(10,2) DEFAULT 0.00,
  `cas_empresa_percentual` decimal(5,2) DEFAULT 15.50,
  `cas_empresa_valor` decimal(10,2) DEFAULT 0.00,
  `total_bruto` decimal(10,2) DEFAULT 0.00,
  `total_liquido` decimal(10,2) DEFAULT 0.00,
  `bonificacao` decimal(10,2) DEFAULT 0.00,
  `ferias_provisao` decimal(10,2) DEFAULT 0.00 COMMENT 'Provisão de férias do mês: (salario_hora × 176) ÷ 12'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionario_obra`
--

CREATE TABLE `funcionario_obra` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `funcionario_id` int(11) NOT NULL,
  `obra_id` int(11) NOT NULL,
  `vinculado_em` timestamp NULL DEFAULT current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `funcionario_obra`
--

INSERT INTO `funcionario_obra` (`id`, `tenant_id`, `funcionario_id`, `obra_id`, `vinculado_em`, `ativo`) VALUES
(24, 1, 2, 8, '2026-02-10 00:19:06', 1),
(126, 1, 20, 21, '2026-03-11 16:03:37', 1),
(127, 1, 21, 21, '2026-03-11 16:03:37', 1),
(167, 1, 24, 38, '2026-03-13 00:13:26', 1),
(168, 1, 17, 19, '2026-03-13 01:26:26', 1),
(169, 1, 18, 19, '2026-03-13 01:26:26', 1),
(170, 1, 19, 19, '2026-03-13 01:26:26', 1),
(179, 1, 20, 20, '2026-03-13 01:26:53', 1),
(180, 1, 21, 20, '2026-03-13 01:26:53', 1),
(185, 1, 12, 18, '2026-03-13 01:29:16', 1),
(186, 1, 13, 18, '2026-03-13 01:29:16', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcoes`
--

CREATE TABLE `funcoes` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `funcoes`
--

INSERT INTO `funcoes` (`id`, `tenant_id`, `nome`, `descricao`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 'Eletricista', 'Profissional especializado em instalações elétricas', 1, '2026-02-06 22:20:41', '2026-02-06 22:20:41'),
(2, 1, 'Encanador', 'Profissional especializado em instalações hidráulicas', 1, '2026-02-06 22:20:41', '2026-02-06 22:20:41'),
(3, 1, 'Pedreiro', 'Profissional especializado em alvenaria e construção', 1, '2026-02-06 22:20:41', '2026-02-06 22:20:41'),
(4, 1, 'Plaquista', 'Profissional especializado em drywall e acabamentos', 1, '2026-02-06 22:20:41', '2026-02-06 22:20:41'),
(5, 1, 'Lampista', 'Profissional especializado em iluminação', 1, '2026-02-06 22:20:41', '2026-02-06 22:20:41');

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `tipo` varchar(50) NOT NULL COMMENT 'obra_criada, funcionario_criado, cliente_criado, apontamento_aprovado, etc',
  `titulo` varchar(255) NOT NULL,
  `mensagem` text NOT NULL,
  `icone` varchar(50) DEFAULT 'bell' COMMENT 'lucide icon name',
  `cor` varchar(20) DEFAULT 'gray' COMMENT 'blue, green, red, orange, etc',
  `url` varchar(255) DEFAULT NULL COMMENT 'URL para onde navegar ao clicar',
  `entidade_tipo` varchar(50) DEFAULT NULL COMMENT 'obra, cliente, funcionario, apontamento, etc',
  `entidade_id` int(11) DEFAULT NULL COMMENT 'ID da entidade relacionada',
  `usuario_id` int(11) DEFAULT NULL,
  `usuario_nome` varchar(255) DEFAULT NULL,
  `usuario_tipo` varchar(50) DEFAULT NULL COMMENT 'admin, encarregado, funcionario',
  `lida` tinyint(1) DEFAULT 0,
  `data_leitura` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `notificacoes`
--

INSERT INTO `notificacoes` (`id`, `tenant_id`, `tipo`, `titulo`, `mensagem`, `icone`, `cor`, `url`, `entidade_tipo`, `entidade_id`, `usuario_id`, `usuario_nome`, `usuario_tipo`, `lida`, `data_leitura`, `created_at`, `updated_at`) VALUES
(1, 1, 'obra_criada', 'Nueva obra creada', 'Obra #20260503 - CREAND BANK fue creada', 'briefcase', 'blue', '/projects', 'obra', 18, NULL, 'Admin User', 'admin', 1, '2026-03-08 21:38:26', '2026-03-07 05:12:32', '2026-03-08 21:38:26'),
(57, 1, 'pendente', 'Registro de Horas Pendiente', 'No has registrado tus horas hoy de la obra 20250922 - CREAND BANK.', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-12 23:05:50', '2026-03-12 23:05:50'),
(60, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 9, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(61, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(62, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 13, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(63, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 17, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(64, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(65, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 19, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(66, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 20, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(67, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 21, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(68, 1, 'geral', 'Aviso General', 'CHEGOU AI CASSIO?', 'bell', 'gray', NULL, NULL, NULL, 24, NULL, NULL, 0, NULL, '2026-03-12 23:05:59', '2026-03-12 23:05:59'),
(71, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 9, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(72, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(73, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 13, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(74, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 17, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(75, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(76, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 19, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(77, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 20, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(78, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 21, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(79, 1, 'geral', 'Aviso General', 'chegou ai cassio?', 'bell', 'gray', NULL, NULL, NULL, 24, NULL, NULL, 0, NULL, '2026-03-12 23:10:17', '2026-03-12 23:10:17'),
(82, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 9, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(83, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(84, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 13, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(85, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 17, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(86, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(87, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 19, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(88, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 20, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(89, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 21, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(90, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 24, NULL, NULL, 0, NULL, '2026-03-12 23:11:35', '2026-03-12 23:11:35'),
(92, 1, 'pendente', 'Registro de Horas Pendiente', 'No has registrado tus horas hoy de la obra 20260503 - Hotel Blue Sea Formentera.', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-12 23:20:36', '2026-03-12 23:20:36'),
(93, 1, 'pendente', 'Registro de Horas Pendiente', 'No has registrado tus horas hoy de la obra 20250922 - CREAND BANK.', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-12 23:23:36', '2026-03-12 23:23:36'),
(96, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 9, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(97, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(98, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 13, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(99, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 17, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(100, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(101, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 19, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(102, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 20, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(103, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 21, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(104, 1, 'geral', 'Aviso General', 'ttt', 'bell', 'gray', NULL, NULL, NULL, 24, NULL, NULL, 0, NULL, '2026-03-12 23:23:46', '2026-03-12 23:23:46'),
(107, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 9, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(108, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(109, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 13, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(110, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 17, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(111, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(112, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 19, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(113, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 20, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(114, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 21, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(115, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 24, NULL, NULL, 0, NULL, '2026-03-12 23:33:40', '2026-03-12 23:33:40'),
(118, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 9, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(119, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(120, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 13, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(121, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 17, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(122, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(123, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 19, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(124, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 20, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(125, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 21, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(126, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 24, NULL, NULL, 0, NULL, '2026-03-12 23:34:10', '2026-03-12 23:34:10'),
(130, 1, 'obra_editada', 'Obra editada', 'Obra #1234 - obra ficticia testee fue modificada', 'edit', 'orange', '/projects', 'obra', 38, 4, 'Administrador Recursos Humanos', 'admin', 0, NULL, '2026-03-13 00:10:20', '2026-03-13 00:10:20'),
(131, 1, 'obra_editada', 'Obra editada', 'Obra #1234 - obra ficticia testee fue modificada', 'edit', 'orange', '/projects', 'obra', 38, 4, 'Administrador Recursos Humanos', 'admin', 0, NULL, '2026-03-13 00:10:27', '2026-03-13 00:10:27'),
(132, 1, 'obra_editada', 'Obra editada', 'Obra #1234 - obra ficticia testee fue modificada', 'edit', 'orange', '/projects', 'obra', 38, 4, 'Administrador Recursos Humanos', 'admin', 0, NULL, '2026-03-13 00:13:12', '2026-03-13 00:13:12'),
(133, 1, 'obra_editada', 'Obra editada', 'Obra #1234 - obra ficticia testee fue modificada', 'edit', 'orange', '/projects', 'obra', 38, 4, 'Administrador Recursos Humanos', 'admin', 0, NULL, '2026-03-13 00:13:26', '2026-03-13 00:13:26'),
(134, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 4, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(136, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 9, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(137, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(138, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 13, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(139, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 17, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(140, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(141, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 19, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(142, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 20, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(143, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 21, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(144, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 24, NULL, NULL, 0, NULL, '2026-03-13 00:54:57', '2026-03-13 00:54:57'),
(145, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 4, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(147, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 9, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(148, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 12, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(149, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 13, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(150, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 17, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(151, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 18, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(152, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 19, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(153, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 20, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(154, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 21, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(155, 1, 'geral', 'Aviso General', 'teste', 'bell', 'gray', NULL, NULL, NULL, 24, NULL, NULL, 0, NULL, '2026-03-13 01:08:29', '2026-03-13 01:08:29'),
(159, 1, 'obra_editada', 'Obra editada', 'Obra #20260303 - Encamp Sport  fue modificada', 'edit', 'orange', '/projects', 'obra', 20, 8, 'Cassio Luis', 'admin', 0, NULL, '2026-03-13 01:26:41', '2026-03-13 01:26:41'),
(160, 1, 'obra_editada', 'Obra editada', 'Obra #20260303 - Encamp Sport  fue modificada', 'edit', 'orange', '/projects', 'obra', 20, 8, 'Cassio Luis', 'admin', 0, NULL, '2026-03-13 01:26:47', '2026-03-13 01:26:47'),
(161, 1, 'obra_editada', 'Obra editada', 'Obra #20260303 - Encamp Sport  fue modificada', 'edit', 'orange', '/projects', 'obra', 20, 8, 'Cassio Luis', 'admin', 0, NULL, '2026-03-13 01:26:53', '2026-03-13 01:26:53'),
(162, 1, 'obra_editada', 'Obra editada', 'Obra #20250922 - CREAND BANK fue modificada', 'edit', 'orange', '/projects', 'obra', 18, 8, 'Cassio Luis', 'admin', 0, NULL, '2026-03-13 01:27:25', '2026-03-13 01:27:25'),
(163, 1, 'obra_editada', 'Obra editada', 'Obra #20250922 - CREAND BANK fue modificada', 'edit', 'orange', '/projects', 'obra', 18, 8, 'Cassio Luis', 'admin', 0, NULL, '2026-03-13 01:29:02', '2026-03-13 01:29:02'),
(164, 1, 'obra_editada', 'Obra editada', 'Obra #20250922 - CREAND BANK fue modificada', 'edit', 'orange', '/projects', 'obra', 18, 8, 'Cassio Luis', 'admin', 0, NULL, '2026-03-13 01:29:16', '2026-03-13 01:29:16');

-- --------------------------------------------------------

--
-- Estrutura para tabela `obras`
--

CREATE TABLE `obras` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `numero` varchar(50) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `encarregado_id` int(11) DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `pais` varchar(100) DEFAULT 'España' COMMENT 'País onde a obra está localizada',
  `fatura_hora_normal` decimal(10,2) DEFAULT 25.00 COMMENT 'Valor/hora normal cobrado do cliente',
  `fatura_hora_extra` decimal(10,2) DEFAULT 37.50 COMMENT 'Valor/hora extra cobrado do cliente',
  `fatura_hora_noturna` decimal(10,2) DEFAULT 50.00 COMMENT 'Valor/hora noturna cobrado do cliente',
  `multiplicador_extra` decimal(5,2) DEFAULT 1.50 COMMENT 'Multiplicador hora extra (ex: 1.5x)',
  `multiplicador_noturna` decimal(5,2) DEFAULT 2.00 COMMENT 'Multiplicador hora noturna (ex: 2x)',
  `imposto_igi` decimal(5,2) DEFAULT 0.00 COMMENT 'IGI - Imposto Geral Indireto (%)',
  `imposto_cas_funcionario` decimal(5,2) DEFAULT 4.70 COMMENT 'CAS Funcionário (%)',
  `imposto_cas_empresa` decimal(5,2) DEFAULT 23.60 COMMENT 'CAS Empresa (%)',
  `imposto_irpc` decimal(5,2) DEFAULT 0.00 COMMENT 'IRPC - Imposto Renda Pessoa Coletiva (%)',
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `email_financeiro` varchar(255) DEFAULT NULL,
  `email_encarregado` varchar(255) DEFAULT NULL,
  `ativa` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dias_desativados` text DEFAULT NULL,
  `finalizada` tinyint(1) DEFAULT 0 COMMENT 'Obra finalizada pelo admin (0=ativa, 1=finalizada)',
  `data_finalizacao` date DEFAULT NULL COMMENT 'Data em que a obra foi marcada como finalizada',
  `finalizada_por` int(11) DEFAULT NULL COMMENT 'ID do usuário que finalizou',
  `permite_hora_extra` tinyint(1) DEFAULT 1 COMMENT 'Se a obra permite marcar horas extras',
  `permite_hora_noturna` tinyint(1) DEFAULT 1 COMMENT 'Se a obra permite marcar horas noturnas'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `obras`
--

INSERT INTO `obras` (`id`, `tenant_id`, `numero`, `nome`, `cliente_id`, `encarregado_id`, `endereco`, `pais`, `fatura_hora_normal`, `fatura_hora_extra`, `fatura_hora_noturna`, `multiplicador_extra`, `multiplicador_noturna`, `imposto_igi`, `imposto_cas_funcionario`, `imposto_cas_empresa`, `imposto_irpc`, `data_inicio`, `data_fim`, `ativo`, `email_financeiro`, `email_encarregado`, `ativa`, `criado_em`, `atualizado_em`, `dias_desativados`, `finalizada`, `data_finalizacao`, `finalizada_por`, `permite_hora_extra`, `permite_hora_noturna`) VALUES
(3, 1, 'TESTE', 'teste', NULL, NULL, 'teste', 'España', 25.00, 37.50, 50.00, 1.50, 2.00, 0.00, 4.70, 23.60, 0.00, NULL, NULL, 0, 'guilherme96v@gmail.com', NULL, 0, '2026-02-03 19:42:01', '2026-02-06 12:42:39', NULL, 0, NULL, NULL, 1, 1),
(8, 1, 'FINAL-TEST', 'Teste Final Sistema', NULL, NULL, '', 'España', 25.00, 37.50, 50.00, 1.50, 2.00, 0.00, 4.70, 23.60, 0.00, '2026-02-05', '2027-02-05', 0, NULL, NULL, 0, '2026-02-10 00:19:06', '2026-02-10 13:26:53', NULL, 0, NULL, NULL, 1, 1),
(18, 1, '20250922', 'CREAND BANK', 2, 12, 'ANDORRA LA VELLA ', 'Andorra', 24.00, 37.50, 50.00, 1.50, 2.00, 4.50, 6.50, 11.50, 0.00, '2026-01-02', '2026-05-02', 1, 'finances@agfs.ad', 'hugo@agfs.ad', 1, '2026-03-04 18:28:53', '2026-03-13 01:29:02', NULL, 0, NULL, NULL, 1, 0),
(19, 1, '20260503', 'Hotel Blue Sea Formentera', 5, NULL, 'Carrer des Fonoll Mari, 3-8 Es Pujoll, Illes Balears', 'España', 27.50, 37.50, 50.00, 1.50, 2.00, 6.00, 11.00, 23.75, 5.00, '2026-03-08', '2026-05-08', 1, 'administracion@mantenopolis.com', NULL, 1, '2026-03-05 19:49:04', '2026-03-12 23:39:18', NULL, 0, NULL, NULL, 0, 0),
(20, 1, '20260303', 'Encamp Sport ', 4, 13, 'Passeig de I\'Alguer S/N Encamp', 'Andorra', 21.00, 0.00, 0.00, 0.00, 2.00, 4.50, 6.50, 11.50, 5.00, '2026-03-03', '2026-07-03', 1, NULL, NULL, 1, '2026-03-05 20:29:08', '2026-03-12 23:12:38', NULL, 0, NULL, NULL, 1, 0),
(21, 1, '20260219', 'Ecler Supermerrcat', 6, NULL, 'Av. Fener - Andorra la Vella ', 'Andorra', 25.00, 0.00, 0.00, 0.00, 2.00, 4.50, 6.50, 11.00, 0.00, '2026-02-02', '2026-02-27', 1, 'comptabilitat@cprojectesvl.com', NULL, 1, '2026-03-05 21:22:56', '2026-03-11 16:03:37', NULL, 0, NULL, NULL, 1, 1),
(38, 1, '1234', 'obra ficticia testee', 7, 5, NULL, 'España', 261.00, 37.51, 50.00, 1.50, 2.00, 3.00, 45.00, 23.10, 10.91, '2026-10-03', '2026-10-04', 1, 'cassio.luis@j2sinstaladora.com.br', 'cassio.luis@j2s.ad', 1, '2026-03-10 19:25:35', '2026-03-13 00:13:25', NULL, 0, NULL, NULL, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `obra_funcionarios`
--

CREATE TABLE `obra_funcionarios` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `obra_id` int(11) NOT NULL,
  `funcionario_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL COMMENT 'Nome da empresa cliente',
  `slug` varchar(50) NOT NULL COMMENT 'Subdomínio (j2s, cliente2...)',
  `razao_social` varchar(255) DEFAULT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL COMMENT 'URL da logo do cliente',
  `primary_color` varchar(7) DEFAULT '#CE0201',
  `secondary_color` varchar(7) DEFAULT '#A00101',
  `favicon_url` varchar(500) DEFAULT NULL,
  `license_key` varchar(100) NOT NULL,
  `license_type` enum('trial','starter','professional','enterprise') DEFAULT 'trial',
  `license_expires_at` date DEFAULT NULL,
  `max_users` int(11) DEFAULT 10,
  `max_projects` int(11) DEFAULT 5,
  `status` enum('ativo','suspenso','cancelado','trial') DEFAULT 'trial',
  `trial_ends_at` date DEFAULT NULL,
  `admin_name` varchar(200) DEFAULT NULL,
  `admin_email` varchar(200) NOT NULL,
  `admin_phone` varchar(50) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'Europe/Madrid',
  `locale` varchar(10) DEFAULT 'es_ES',
  `currency` varchar(3) DEFAULT 'EUR',
  `custom_domain` varchar(255) DEFAULT NULL COMMENT 'Domínio customizado (opcional)',
  `onboarding_completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tenants`
--

INSERT INTO `tenants` (`id`, `nome`, `slug`, `razao_social`, `cnpj`, `logo_url`, `primary_color`, `secondary_color`, `favicon_url`, `license_key`, `license_type`, `license_expires_at`, `max_users`, `max_projects`, `status`, `trial_ends_at`, `admin_name`, `admin_email`, `admin_phone`, `timezone`, `locale`, `currency`, `custom_domain`, `onboarding_completed`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'J2S Construções', 'j2s', 'J2S Construções e Obras Ltda', NULL, '/tenants/j2s/logo.png', '#CE0201', '#A00101', NULL, 'PK-J2S-2026-PILOT-001', 'enterprise', NULL, 999, 999, 'ativo', NULL, 'Administrador J2S', 'admin@j2s.ad', NULL, 'Europe/Madrid', 'es_ES', 'EUR', NULL, 1, '2026-03-09 13:08:55', '2026-03-09 13:08:55', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL DEFAULT 1,
  `passaporte` varchar(50) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `funcao` varchar(100) DEFAULT NULL,
  `salario_base` decimal(10,2) DEFAULT NULL,
  `salario_hora` decimal(10,2) DEFAULT NULL,
  `vale_moradia` decimal(10,2) DEFAULT 0.00,
  `ibf` decimal(10,2) DEFAULT 0.00,
  `foto_url` varchar(500) DEFAULT NULL,
  `fcm_token` varchar(255) DEFAULT NULL COMMENT 'Firebase Cloud Messaging token para push notifications',
  `biometria_credential_id` text DEFAULT NULL,
  `biometria_public_key` text DEFAULT NULL,
  `biometria_cadastrada` tinyint(1) DEFAULT 0,
  `tipo` enum('funcionario','encarregado','admin') NOT NULL DEFAULT 'funcionario',
  `funcao_id` int(11) DEFAULT NULL,
  `salario_base_mensal` decimal(10,2) DEFAULT NULL,
  `encarregado_id` int(11) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `valor_hora_normal_fatura` decimal(10,2) DEFAULT NULL COMMENT 'Valor por hora normal para faturamento (cobrar ao cliente)',
  `valor_hora_extra_fatura` decimal(10,2) DEFAULT NULL COMMENT 'Valor por hora extra para faturamento (cobrar ao cliente)',
  `valor_hora_noturna_fatura` decimal(10,2) DEFAULT NULL COMMENT 'Valor por hora noturna para faturamento (cobrar ao cliente)',
  `valor_hora_venda` decimal(10,2) DEFAULT 24.00,
  `biometria` tinyint(1) DEFAULT 0 COMMENT 'Se tem biometria cadastrada',
  `bonificacao` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `tenant_id`, `passaporte`, `senha_hash`, `nome`, `email`, `telefone`, `funcao`, `salario_base`, `salario_hora`, `vale_moradia`, `ibf`, `foto_url`, `fcm_token`, `biometria_credential_id`, `biometria_public_key`, `biometria_cadastrada`, `tipo`, `funcao_id`, `salario_base_mensal`, `encarregado_id`, `ativo`, `criado_em`, `atualizado_em`, `valor_hora_normal_fatura`, `valor_hora_extra_fatura`, `valor_hora_noturna_fatura`, `valor_hora_venda`, `biometria`, `bonificacao`) VALUES
(1, 1, 'ENC001', '$2y$10$jtbIyXaq2B8wfMqdJLvxTe3GtlAolPoCHnWpi0uIfwhIonK2pWAb2', 'Hugo Encarregado AGFS', 'hugo@agfs.ad', '', NULL, NULL, NULL, 0.00, 0.00, '/login/backend/uploads/fotos/user_1_1770158850.webp', NULL, NULL, NULL, 0, 'encarregado', NULL, NULL, NULL, 0, '2026-02-02 18:39:48', '2026-03-11 15:53:43', NULL, NULL, NULL, 0.00, 1, 0.00),
(2, 1, 'FUNC001', '$2y$10$nrdmwLsGfKYjlW8KEb81ueitzlLyAenx4M4PQMzJP0eSxck1fz8cC', 'Juan García', 'juan@j2s.ad', '', NULL, 2000.00, 24.00, 100.00, 200.00, '/login/backend/uploads/fotos/user_2_1770162487.webp', NULL, NULL, NULL, 0, 'funcionario', 1, 2000.00, 1, 0, '2026-02-02 18:39:48', '2026-03-11 15:54:00', NULL, NULL, NULL, 24.00, 0, 24.00),
(3, 1, 'FUNC002', '$2y$10$zZ8otZkXjswnEexZZkwmhuVzZ6cRhAD3cQldo62XfA2gU5G44Qtbe', 'Maria López', 'maria@j2s.ad', NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, 0, 'funcionario', NULL, NULL, 1, 0, '2026-02-02 18:39:48', '2026-02-05 18:38:49', NULL, NULL, NULL, 24.00, 0, 0.00),
(4, 1, 'ADMIN', '$2y$10$hyx...vh8ggqDljVRBqil.wNsLXnC0tQ3yHLFH43euV1AsBLa4Y/O', 'Administrador Recursos Humanos', 'admin@j2s.ad', '', '', NULL, NULL, 0.00, 0.00, '/backend/uploads/fotos/user_4_1773366764.webp', NULL, NULL, NULL, 0, 'admin', NULL, NULL, NULL, 1, '2026-02-02 21:36:44', '2026-03-13 01:52:44', NULL, NULL, NULL, 24.00, 0, 0.00),
(5, 1, 'FUNC003', '$2y$10$syZyH27dzMgUYQI6C68/7eZMdVtl9Eb5AvEeDOpDzAGJXKnwwIjHy', 'Julio menezes', '', '', NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, NULL, NULL, 0, '2026-02-12 11:52:36', '2026-03-05 20:04:52', NULL, NULL, NULL, 24.00, 0, 0.00),
(6, 1, 'GUILHERME', '$2y$10$TOJonRJqCHH74gaXRs0e3Ojxo8R.G7zGxCUxOUHKXtlzuBiH9AXu.', 'guilherme', 'guilherme96v@gmail.com', '', NULL, 2000.00, 14.00, 14.00, 14.00, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 2000.00, NULL, 0, '2026-02-20 16:31:54', '2026-03-07 04:30:48', NULL, NULL, NULL, 24.00, 1, 13.99),
(7, 1, 'GOOGLE', '$2y$10$c/LOeghdhBPifXVWMeTwp.p0/lPfzsJRC385FQBoN2wi.bNPeST4m', 'Google Tester', 'google@google.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'admin', NULL, NULL, NULL, 0, '2026-02-27 15:42:25', '2026-03-05 20:04:04', NULL, NULL, NULL, 24.00, 0, 0.00),
(8, 1, 'GK492266', '$2y$10$pHgzf.kQr8Dd8jabrc4yw.25K.y7.vobX5M8rxboNn277t3cUawRG', 'Cassio Luis', 'cassio.luis@j2sinstaladora.com.br', '', NULL, NULL, NULL, NULL, NULL, '/backend/uploads/fotos/user_8_1773370523.webp', NULL, NULL, NULL, 0, 'admin', NULL, NULL, NULL, 1, '2026-03-04 17:44:38', '2026-03-13 02:55:23', NULL, NULL, NULL, 24.00, 1, 0.00),
(9, 1, 'PETER', '$2y$10$O0flQXZ256FvOa7z15xtoOL3MmUXX5LDFQCsWCrTPagnzYRdiPl2u', 'PETER', 'r9viral@gmail.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'admin', NULL, NULL, NULL, 1, '2026-03-04 17:47:14', '2026-03-04 17:47:14', NULL, NULL, NULL, 24.00, 0, 0.00),
(10, 1, 'ENCARREGADO', '$2y$10$m2VfUxbpB8jXf.frx1/RiuvmjyCboGkhbDf0l7lkthURFM9hRbugC', 'ENCARREGADO FANTASMA TESTE', 'cassio.luis@j2s.ad', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'encarregado', NULL, NULL, NULL, 0, '2026-03-04 17:49:41', '2026-03-05 20:04:00', NULL, NULL, NULL, 24.00, 1, 0.00),
(11, 1, 'FUNCIONARIO', '$2y$10$BpfoK5eay5C/n29HGoCVeODgYYgouT1jABRBbK0kShgPgV5zOa7OK', 'FUNCIONARIO FANTASMA TESTE', 'cassio.luis@j2s.ad', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, NULL, NULL, 0, '2026-03-04 17:50:20', '2026-03-05 20:04:07', NULL, NULL, NULL, 24.00, 1, 0.00),
(12, 1, 'GK353002', '$2y$10$3J6WK67/TkeOvl11C5yOTeBjIPlh0H2LpxOCSFC5Yb4JOSB12LzMK', 'Alex Paulino dos Santos', 'alexpaulinoneo@gmail.com', '', NULL, 1879.00, 15.00, 350.00, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 1879.00, NULL, 1, '2026-03-04 18:09:26', '2026-03-05 20:06:32', NULL, NULL, NULL, 24.00, 1, 0.00),
(13, 1, 'BG260374', '$2y$10$00hG0zLBtKRdUw7Vs6zEmOwA1mLprlrCJPqW3qSUIksxDOCk3is76', 'Havy Muñoz Ocampo', 'harvy2070@hotmail.com', '', NULL, 1876.00, 13.00, 250.00, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 1876.00, NULL, 1, '2026-03-04 18:15:21', '2026-03-10 20:26:13', NULL, NULL, NULL, 24.00, 1, 0.00),
(14, 1, 'PITER', '$2y$10$FHkupYNQHlQtZdldQAOIgueiNzDzqqMISCWT5OBDFrqv2yM0IS72e', 'PITER', 'r9viral@gmail.com', '', NULL, 1876.00, 14.00, 250.00, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 1876.00, NULL, 0, '2026-03-04 18:48:16', '2026-03-05 20:05:13', NULL, NULL, NULL, 24.00, 1, 0.00),
(15, 1, 'GK492200', '$2y$10$8S8e.4MS..O1fnjdgfbFFe/QJAjFg6F9R8IGMimHo9.hR./FsqemS', 'Cassio Battaglini ', 'cassio.luis@j2s.ad', '', NULL, 2000.00, 15.00, 350.00, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 2000.00, NULL, 0, '2026-03-04 18:50:36', '2026-03-11 15:53:20', NULL, NULL, NULL, 24.00, 1, 0.00),
(16, 1, 'GB932968', '$2y$10$rsYt8I4wctzX5pwSTylU3eybKu622Hs4hK9jQfc2xOzd54G8esZEm', 'Jeferson Costa Cummingham', 'jeferson.es.cunningham@gmail.com', '', NULL, 980.00, 13.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 980.00, NULL, 0, '2026-03-05 19:53:37', '2026-03-11 15:53:50', NULL, NULL, NULL, 27.50, 1, 1560.00),
(17, 1, 'FV305373', '$2y$10$eN7VWO973aRFyDvUOkxPH.E2rKNS.qbziDzmK36AHdCp3ozV/mkfO', 'João Paulo Santos Bastos', 'jpsba10@gmail.com', '', NULL, 980.00, 14.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 980.00, NULL, 1, '2026-03-05 19:57:41', '2026-03-05 19:57:41', NULL, NULL, NULL, 27.50, 1, 1708.00),
(18, 1, 'YD038678', '$2y$10$mkF61zpqnjj1ptCc4D8fBOd.X8bhAShAHYMWu0b2C0zT98saTXiqS', 'Samuel Pereira de Melo', 'pereirademelosamuel@gmail.com', '', NULL, 980.00, 14.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 980.00, NULL, 1, '2026-03-05 20:00:26', '2026-03-12 23:40:03', NULL, NULL, NULL, 27.50, 1, 1708.00),
(19, 1, 'FW890513', '$2y$10$p/mwdNWyQNI8nUObp8.J7ODfPN5ovbeALcNPmag/wTOYWfihT.ay6', 'Vinicuis Gomes da Silva', 'vini_vns157@hotmail.com', '', NULL, 980.00, 14.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 1, 980.00, NULL, 1, '2026-03-05 20:02:39', '2026-03-13 01:28:25', NULL, NULL, NULL, 27.50, 1, 1708.00),
(20, 1, 'FW556649', '$2y$10$Uv/uVzA2bWDAkfxqyTOVhecKRgW5Z3hVXyebM3G2SIM4DDcAwJmHW', 'Ataide Barras de Oliveira ', 'athaides2018@outlook.com', '', NULL, 1879.00, 14.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 3, 1879.00, NULL, 1, '2026-03-05 20:21:01', '2026-03-05 20:21:01', NULL, NULL, NULL, 21.00, 1, 809.00),
(21, 1, 'GL803145', '$2y$10$HBvMLzRD7nalmO81teflUOgHl5DurAGR5Z1s.4j/5zehSzBGdvtUS', 'Robson Tavares', 'robsontavaressalete@gmail.com', '', NULL, 1879.00, 14.00, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'funcionario', 3, 1879.00, NULL, 1, '2026-03-05 20:25:19', '2026-03-05 20:25:19', NULL, NULL, NULL, 21.00, 1, 809.00),
(22, 1, '618331027', '$2y$10$uj2y1ONomJJOCt9kxrxKReEBegucQ2ZcPkFLkFVcEnxhlEUqbrPP2', 'Jorge Manrique', 'jmannrique@mantenopolis.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'encarregado', NULL, NULL, NULL, 0, '2026-03-05 21:26:34', '2026-03-11 15:54:12', NULL, NULL, NULL, 24.00, 1, 0.00),
(23, 1, '+376 322 945', '$2y$10$F11cOLJa0hrfdap0FLcC.eXqc4nMlGrrNuXjKFkEx1kNW9qh70Mvi', 'Helena CIP', 'comptabilitat@cprojectesvl.com', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'encarregado', NULL, NULL, NULL, 0, '2026-03-05 21:36:38', '2026-03-11 15:53:32', NULL, NULL, NULL, 24.00, 1, 0.00),
(24, 1, 'GUILHERMEEE', '$2y$10$cRMI2YQpIBjNdeoZe3fCVeWGvZyAxkrlSL6jpoDKW1CYl25Pr9zHO', 'Guilherme Admin', 'admin@puntoclicks.com', '', NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, 0, 'funcionario', NULL, NULL, NULL, 1, '2026-03-09 17:01:33', '2026-03-10 18:05:40', NULL, NULL, NULL, 24.00, 0, 0.00),
(25, 1, '123123123', '$2y$10$tOOxdSsbhw7vDmrOsSGKoOdkz57tB4xPvOSOlPXIQW0QtPUOwEzVu', 'teste', 'testes', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'admin', NULL, NULL, NULL, 0, '2026-03-12 23:56:33', '2026-03-12 23:56:44', NULL, NULL, NULL, 24.00, 0, 0.00);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `apontamentos`
--
ALTER TABLE `apontamentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_funcionario_semana_obra` (`funcionario_id`,`obra_id`,`semana_inicio`),
  ADD KEY `idx_funcionario` (`funcionario_id`),
  ADD KEY `idx_obra` (`obra_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_semana` (`semana_inicio`),
  ADD KEY `idx_aprovado_admin_por` (`aprovado_admin_por`),
  ADD KEY `fk_apontamentos_aprovador` (`aprovado_por`),
  ADD KEY `idx_deletado` (`deletado_em`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_tenant_status` (`tenant_id`,`status`),
  ADD KEY `idx_tenant_semana` (`tenant_id`,`semana_inicio`);

--
-- Índices de tabela `aprovacao_tokens`
--
ALTER TABLE `aprovacao_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_apontamento` (`apontamento_id`),
  ADD KEY `idx_encarregado` (`encarregado_id`),
  ADD KEY `idx_tenant` (`tenant_id`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_clientes_documento` (`documento`),
  ADD KEY `idx_clientes_nif` (`nif`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chave` (`chave`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `config_fiscal`
--
ALTER TABLE `config_fiscal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `config_impostos`
--
ALTER TABLE `config_impostos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `config_valores`
--
ALTER TABLE `config_valores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `config_valores_faturamento`
--
ALTER TABLE `config_valores_faturamento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `despesas_indiretas`
--
ALTER TABLE `despesas_indiretas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_obra_mes` (`obra_id`,`mes_referencia`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `encarregados`
--
ALTER TABLE `encarregados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `faturamento`
--
ALTER TABLE `faturamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_obra_mes` (`obra_id`,`mes_referencia`),
  ADD KEY `idx_mes_referencia` (`mes_referencia`),
  ADD KEY `idx_obra` (`obra_id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `folha_pagamento`
--
ALTER TABLE `folha_pagamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_funcionario_obra_mes` (`funcionario_id`,`obra_id`,`mes_referencia`),
  ADD KEY `idx_mes_referencia` (`mes_referencia`),
  ADD KEY `idx_funcionario` (`funcionario_id`),
  ADD KEY `idx_obra` (`obra_id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `funcionario_obra`
--
ALTER TABLE `funcionario_obra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_funcionario_obra` (`funcionario_id`,`obra_id`),
  ADD KEY `fk_funcionario_obra_obra` (`obra_id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `funcoes`
--
ALTER TABLE `funcoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lida` (`lida`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_entidade` (`entidade_tipo`,`entidade_id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `obras`
--
ALTER TABLE `obras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `idx_ativa` (`ativa`),
  ADD KEY `idx_cliente` (`cliente_id`),
  ADD KEY `idx_encarregado` (`encarregado_id`),
  ADD KEY `idx_data_inicio` (`data_inicio`),
  ADD KEY `idx_data_fim` (`data_fim`),
  ADD KEY `idx_pais` (`pais`),
  ADD KEY `idx_finalizada` (`finalizada`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_tenant_numero` (`tenant_id`,`numero`);

--
-- Índices de tabela `obra_funcionarios`
--
ALTER TABLE `obra_funcionarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_obra_funcionario` (`obra_id`,`funcionario_id`),
  ADD KEY `funcionario_id` (`funcionario_id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Índices de tabela `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `license_key` (`license_key`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_license_key` (`license_key`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `passaporte` (`passaporte`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_encarregado` (`encarregado_id`),
  ADD KEY `idx_passaporte` (`passaporte`),
  ADD KEY `fk_usuarios_funcao` (`funcao_id`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_tenant_tipo` (`tenant_id`,`tipo`),
  ADD KEY `idx_tenant_email` (`tenant_id`,`email`),
  ADD KEY `idx_fcm_token` (`fcm_token`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `apontamentos`
--
ALTER TABLE `apontamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de tabela `aprovacao_tokens`
--
ALTER TABLE `aprovacao_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `config_fiscal`
--
ALTER TABLE `config_fiscal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `config_impostos`
--
ALTER TABLE `config_impostos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `config_valores`
--
ALTER TABLE `config_valores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `config_valores_faturamento`
--
ALTER TABLE `config_valores_faturamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `despesas_indiretas`
--
ALTER TABLE `despesas_indiretas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `encarregados`
--
ALTER TABLE `encarregados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `faturamento`
--
ALTER TABLE `faturamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `folha_pagamento`
--
ALTER TABLE `folha_pagamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `funcionario_obra`
--
ALTER TABLE `funcionario_obra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT de tabela `funcoes`
--
ALTER TABLE `funcoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT de tabela `obras`
--
ALTER TABLE `obras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de tabela `obra_funcionarios`
--
ALTER TABLE `obra_funcionarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `apontamentos`
--
ALTER TABLE `apontamentos`
  ADD CONSTRAINT `apontamentos_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  ADD CONSTRAINT `fk_apontamentos_aprovador` FOREIGN KEY (`aprovado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_apontamentos_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_apontamentos_obra` FOREIGN KEY (`obra_id`) REFERENCES `obras` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aprovado_admin_por` FOREIGN KEY (`aprovado_admin_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `aprovacao_tokens`
--
ALTER TABLE `aprovacao_tokens`
  ADD CONSTRAINT `aprovacao_tokens_ibfk_1` FOREIGN KEY (`apontamento_id`) REFERENCES `apontamentos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aprovacao_tokens_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `usuarios` (`tenant_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `configuracoes`
--
ALTER TABLE `configuracoes`
  ADD CONSTRAINT `configuracoes_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `config_fiscal`
--
ALTER TABLE `config_fiscal`
  ADD CONSTRAINT `config_fiscal_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `config_impostos`
--
ALTER TABLE `config_impostos`
  ADD CONSTRAINT `config_impostos_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `config_valores`
--
ALTER TABLE `config_valores`
  ADD CONSTRAINT `config_valores_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `config_valores_faturamento`
--
ALTER TABLE `config_valores_faturamento`
  ADD CONSTRAINT `config_valores_faturamento_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `despesas_indiretas`
--
ALTER TABLE `despesas_indiretas`
  ADD CONSTRAINT `despesas_indiretas_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `encarregados`
--
ALTER TABLE `encarregados`
  ADD CONSTRAINT `encarregados_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `faturamento`
--
ALTER TABLE `faturamento`
  ADD CONSTRAINT `faturamento_ibfk_1` FOREIGN KEY (`obra_id`) REFERENCES `obras` (`id`),
  ADD CONSTRAINT `faturamento_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `folha_pagamento`
--
ALTER TABLE `folha_pagamento`
  ADD CONSTRAINT `folha_pagamento_ibfk_1` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `folha_pagamento_ibfk_2` FOREIGN KEY (`obra_id`) REFERENCES `obras` (`id`),
  ADD CONSTRAINT `folha_pagamento_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `funcionario_obra`
--
ALTER TABLE `funcionario_obra`
  ADD CONSTRAINT `fk_funcionario_obra_obra` FOREIGN KEY (`obra_id`) REFERENCES `obras` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `funcionario_obra_ibfk_1` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `funcionario_obra_ibfk_2` FOREIGN KEY (`obra_id`) REFERENCES `obras` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `funcionario_obra_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `funcoes`
--
ALTER TABLE `funcoes`
  ADD CONSTRAINT `funcoes_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `obras`
--
ALTER TABLE `obras`
  ADD CONSTRAINT `obras_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `obras_ibfk_2` FOREIGN KEY (`encarregado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `obras_ibfk_3` FOREIGN KEY (`encarregado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `obras_ibfk_4` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `obra_funcionarios`
--
ALTER TABLE `obra_funcionarios`
  ADD CONSTRAINT `obra_funcionarios_ibfk_1` FOREIGN KEY (`obra_id`) REFERENCES `obras` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `obra_funcionarios_ibfk_2` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `obra_funcionarios_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Restrições para tabelas `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_funcao` FOREIGN KEY (`funcao_id`) REFERENCES `funcoes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`encarregado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
