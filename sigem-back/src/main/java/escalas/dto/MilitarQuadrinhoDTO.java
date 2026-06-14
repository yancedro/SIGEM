package escalas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MilitarQuadrinhoDTO {
    private Long militarId;
    private String nomeGuerra;
    private String posto;
    private Double totalQuadrinhos; // Se der erro de tipo, tente mudar para Double
}